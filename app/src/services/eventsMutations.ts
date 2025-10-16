import { RecurrenceRuleFormData } from '../components/EventModal'
import type { SelectedEvent } from '../types'

export type CreateEventPayload = {
	title: string
	description: string | null
	startTime: string
	endTime: string | null
	recurrence?: RecurrenceRuleFormData
}

export async function createEvent(
	payload: CreateEventPayload
): Promise<SelectedEvent> {
	const res = await fetch('/api/events', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	})

	if (!res.ok) {
		const { error } = await res.json()
		throw new Error(error || 'Failed to create event')
	}

	return await res.json()
}

export type UpdateEventPayload = Partial<{
	title: string
	description: string | null
	startTime: string
	endTime: string | null
}>

export async function updateEvent(
	id: number,
	payload: UpdateEventPayload
): Promise<SelectedEvent> {
	const res = await fetch(`/api/events/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	})
	if (!res.ok) {
		const { error } = await res.json()
		throw new Error(error || 'Failed to update event')
	}
	return await res.json()
}

export async function deleteEvent(id: number): Promise<void> {
	const res = await fetch(`/api/events/${id}`, { method: 'DELETE' })
	if (!res.ok) throw new Error('Failed to delete event')
}
