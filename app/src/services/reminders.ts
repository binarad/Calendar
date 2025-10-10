import { fetchRemindersForEvent } from './eventDetails'
import type { Reminder } from '../types'

export async function addReminder(
	eventId: number,
	minutesBefore: number
): Promise<Reminder[]> {
	const res = await fetch(`/api/events/${eventId}/reminders`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ minutesBefore }),
	})
	if (!res.ok) throw new Error('Failed to add reminder')
	// After mutation, fetch the list to stay consistent
	return await fetchRemindersForEvent(eventId)
}

export async function deleteReminder(
	eventId: number,
	minutesBefore: number
): Promise<Reminder[]> {
	const res = await fetch(`/api/events/${eventId}/reminders/${minutesBefore}`, {
		method: 'DELETE',
	})
	if (!res.ok) throw new Error('Failed to delete reminder')
	return await fetchRemindersForEvent(eventId)
}
