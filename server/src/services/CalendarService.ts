import { EventModel, EventData } from '../models/EventModel'
import { ReminderData, ReminderModel } from '../models/ReminderModel'
import {
	RecurrenceRuleData,
	RecurrenceRuleModel,
} from '../models/RecurrenceRuleModel'
import { RRule, Weekday } from 'rrule'
import type { Options as RRuleOptions, Frequency } from 'rrule'
import { NotificationCenter } from './NotificationCenter'
import ical, { ICalCalendar } from 'ical-generator'

export interface CreateEventInput extends Omit<EventData, 'id'> {
	recurrence?: RecurrenceRuleData | null
	reminders?: number[] // minutes before
}

export class CalendarService {
	private events = new EventModel()
	private rules = new RecurrenceRuleModel()
	private reminders = new ReminderModel()
	private notifier = NotificationCenter.getInstance()

	async createEvent(
		input: CreateEventInput
	): Promise<EventData & { reminders: ReminderData[] }> {
		let recurrenceRuleId: number | undefined | null = null
		if (input.recurrence) {
			const savedRule = await this.rules.create(input.recurrence)
			recurrenceRuleId = savedRule.id
		}

		const savedEvent = await this.events.create({
			title: input.title,
			description: input.description,
			startTime: input.startTime,
			endTime: input.endTime ?? null,
			recurrenceRuleId: recurrenceRuleId ?? null,
		})

		const createdReminders: ReminderData[] = []
		if (input.reminders?.length) {
			for (const minutesBefore of input.reminders) {
				createdReminders.push(
					await this.reminders.create({
						eventId: savedEvent.id!,
						minutesBefore,
					})
				)
			}
		}

		return { ...savedEvent, reminders: createdReminders }
	}

	async listEvents(): Promise<EventData[]> {
		return this.events.getAll()
	}

	async updateEvent(
		id: number,
		updates: Partial<EventData>
	): Promise<EventData> {
		return this.events.update(id, updates)
	}

	async deleteEvent(id: number): Promise<void> {
		await this.events.delete(id)
	}

	async getOccurrences(
		eventId: number,
		fromISO: string,
		toISO: string
	): Promise<string[]> {
		const event = await this.events.getById(eventId)
		if (!event) throw new Error('Event not found')

		const from = new Date(fromISO)
		const to = new Date(toISO)

		if (!event.recurrenceRuleId) {
			const start = new Date(event.startTime)
			return start >= from && start <= to ? [event.startTime] : []
		}

		const rule = await this.rules.getById(event.recurrenceRuleId)
		if (!rule) return []

		const rrule = new RRule(this.mapRule(rule, event.startTime))
		const dates = rrule.between(from, to, true)
		return dates.map(d => d.toISOString())
	}

	// naive in-memory scheduler: schedules reminders within next hour
	scheduleRemindersForEvent(eventId: number): void {
		;(async () => {
			const event = await this.events.getById(eventId)
			if (!event) return
			const reminders = await this.reminders.getByEvent(eventId)
			if (!reminders.length) return

			const now = new Date()
			const windowEnd = new Date(now.getTime() + 60 * 60 * 1000)

			const occs = await this.getOccurrences(
				eventId,
				now.toISOString(),
				windowEnd.toISOString()
			)

			for (const occ of occs) {
				const occDate = new Date(occ)
				for (const r of reminders) {
					const triggerAt = new Date(
						occDate.getTime() - r.minutesBefore * 60 * 1000
					)
					const delay = triggerAt.getTime() - now.getTime()
					if (delay > 0 && delay <= 60 * 60 * 1000) {
						setTimeout(() => {
							this.notifier.notifyReminder({
								eventId,
								when: occDate.toISOString(),
								minutesBefore: r.minutesBefore,
							})
						}, delay)
					}
				}
			}
		})()
	}

	async exportEventAsICal(eventId: number): Promise<ICalCalendar> {
		const event = await this.events.getById(eventId)
		if (!event) throw new Error('Event not found')

		const cal = ical({
			name: 'Calendar Export',
			prodId: {
				company: 'Uni_Projects',
				product: 'Calendar',
				language: 'EN',
			},
		})
		const vevent = cal.createEvent({
			id: `event-${String(event.id)}@uni-projects-calendar`,
			start: new Date(event.startTime),
			end: event.endTime ? new Date(event.endTime) : undefined,
			summary: event.title,
			description: event.description ?? undefined,
			stamp: new Date(),
		})

		if (event.recurrenceRuleId) {
			const rule = await this.rules.getById(event.recurrenceRuleId)
			if (rule) {
				const parts: string[] = [
					`FREQ=${rule.freq}`,
					`INTERVAL=${rule.interval ?? 1}`,
				]
				if (rule.byday) parts.push(`BYDAY=${rule.byday}`)
				if (rule.until)
					parts.push(
						`UNTIL=${
							new Date(rule.until)
								.toISOString()
								.replace(/[-:]/g, '')
								.split('.')[0]
						}Z`
					)
				if (rule.count != null) parts.push(`COUNT=${rule.count}`)
				vevent.repeating(parts.join(';'))
			}
		}

		return cal
	}

	async exportAllAsICal(): Promise<ICalCalendar> {
		const cal = ical({
			name: 'Calendar Export',
			prodId: {
				company: 'Uni_Projects',
				product: 'Calendar',
				language: 'EN',
			},
		})

		const allEvents = await this.events.getAll()
		for (const e of allEvents) {
			const vevent = cal.createEvent({
				id: `event-${String(e.id)}@uni-projects-calendar`,
				start: new Date(e.startTime),
				end: e.endTime ? new Date(e.endTime) : undefined,
				summary: e.title,
				description: e.description ?? undefined,
				stamp: new Date(),
			})

			if (e.recurrenceRuleId) {
				const rule = await this.rules.getById(e.recurrenceRuleId)
				if (rule) {
					const parts: string[] = [
						`FREQ=${rule.freq}`,
						`INTERVAL=${rule.interval ?? 1}`,
					]
					if (rule.byday) parts.push(`BYDAY=${rule.byday}`)
					if (rule.until)
						parts.push(
							`UNTIL=${
								new Date(rule.until)
									.toISOString()
									.replace(/[-:]/g, '')
									.split('.')[0]
							}Z`
						)
					if (rule.count != null) parts.push(`COUNT=${rule.count}`)
					vevent.repeating(parts.join(';'))
				}
			}
		}

		return cal
	}

	private mapRule(
		rule: RecurrenceRuleData,
		startTimeISO: string
	): RRuleOptions {
		const options: Partial<RRuleOptions> = {
			dtstart: new Date(startTimeISO),
			freq: this.mapFreq(rule.freq),
			interval: rule.interval ?? 1,
			wkst: RRule.MO,
		}
		if (rule.byday) {
			options.byweekday = rule.byday
				.split(',')
				.map(s => this.parseWeekday(s.trim()))
		}
		if (rule.until) options.until = new Date(rule.until)
		if (rule.count != null) options.count = rule.count
		return options as RRuleOptions
	}

	private mapFreq(freq: RecurrenceRuleData['freq']): Frequency {
		switch (freq) {
			case 'DAILY':
				return RRule.DAILY
			case 'WEEKLY':
				return RRule.WEEKLY
			case 'MONTHLY':
				return RRule.MONTHLY
		}
	}

	private parseWeekday(label: string): Weekday {
		const map: Record<string, Weekday> = {
			MO: RRule.MO,
			MON: RRule.MO,
			TUE: RRule.TU,
			TU: RRule.TU,
			WED: RRule.WE,
			WE: RRule.WE,
			THU: RRule.TH,
			TH: RRule.TH,
			FRI: RRule.FR,
			FR: RRule.FR,
			SAT: RRule.SA,
			SA: RRule.SA,
			SUN: RRule.SU,
			SU: RRule.SU,
		}
		const key = label.toUpperCase()
		return map[key] ?? RRule.MO
	}
}
