import type { SelectedEvent, Reminder } from '../types'

export async function fetchEventById(id: number): Promise<SelectedEvent | null> {
	const res = await fetch('/api/events')
	if (!res.ok) throw new Error('Failed to load events')
	const all: Array<{
		id: number
		title: string
		description?: string | null
		startTime: string
		endTime?: string | null
	}> = await res.json()
	return all.find(e => e.id === id) || null
}

export async function fetchRemindersForEvent(id: number): Promise<Reminder[]> {
	const remRes = await fetch(`/api/events/${id}/reminders`)
	if (!remRes.ok) return []
	const rems: Reminder[] = await remRes.json()
	return rems
}

export async function fetchOccurrencesForEvent(
	id: number,
	from: Date,
	to: Date
): Promise<string[]> {
	const occRes = await fetch(
		`/api/events/${id}/occurrences?from=${from.toISOString()}&to=${to.toISOString()}`
	)
	if (!occRes.ok) return []
	const occs: string[] = await occRes.json()
	return occs
}

export async function fetchEventDetails(id: number): Promise<{
	selectedEvent: SelectedEvent | null
	selectedReminders: Reminder[]
	selectedOccurrences: string[]
}> {
	const from = new Date()
	const to = new Date(from.getTime() + 30 * 24 * 60 * 60 * 1000)
	const [selectedEvent, selectedReminders, selectedOccurrences] = await Promise.all([
		fetchEventById(id),
		fetchRemindersForEvent(id),
		fetchOccurrencesForEvent(id, from, to),
	])
	return { selectedEvent, selectedReminders, selectedOccurrences }
}


