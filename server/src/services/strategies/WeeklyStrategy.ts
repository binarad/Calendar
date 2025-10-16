import { IRecurrenceStrategy } from './IRecurrenceStrategy'
import type { RecurrenceRuleData } from '../../models/RecurrenceRuleModel'
import { RRule, Weekday } from 'rrule'
import type { Options as RRuleOptions } from 'rrule'

// We move this helper function inside the file that needs it
function parseWeekday(label: string): Weekday {
	const map: Record<string, Weekday> = {
		MO: RRule.MO,
		TU: RRule.TU,
		WE: RRule.WE,
		TH: RRule.TH,
		FR: RRule.FR,
		SA: RRule.SA,
		SU: RRule.SU,
	}
	return map[label.toUpperCase().substring(0, 2)] ?? RRule.MO
}

export class WeeklyStrategy implements IRecurrenceStrategy {
	createRRuleOptions(
		rule: RecurrenceRuleData,
		startTime: string
	): Partial<RRuleOptions> {
		const options: Partial<RRuleOptions> = {
			freq: RRule.WEEKLY,
			dtstart: new Date(startTime),
			interval: rule.interval ?? 1,
			wkst: RRule.MO,
		}

		if (rule.byday) {
			options.byweekday = rule.byday.split(',').map(s => parseWeekday(s.trim()))
		}
		if (rule.until) options.until = new Date(rule.until)
		if (rule.count != null) options.count = rule.count

		return options
	}
}
