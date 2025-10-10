import type { DateSelectArg } from '@fullcalendar/core'

export async function handleDateSelect(
	selectInfo: DateSelectArg
): Promise<void> {
	const title = prompt('Please enter a new title for your event')
	const description = title ? prompt('Optional: enter a description') : null
	const calendarApi = selectInfo.view.calendar

	calendarApi.unselect()

	if (title) {
		try {
			const res = await fetch('/api/events', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title,
					description:
						description && description.trim() !== '' ? description : null,
					startTime: selectInfo.startStr,
					endTime: selectInfo.endStr ?? null,
				}),
			})
			if (!res.ok) throw new Error('Failed to create event')
			const created: {
				id: number
				title: string
				startTime: string
				endTime?: string | null
			} = await res.json()
			calendarApi.addEvent({
				id: String(created.id),
				title: created.title,
				start: created.startTime,
				end: created.endTime ?? undefined,
				allDay: selectInfo.allDay,
			})
		} catch (e) {
			console.error(e)
			alert('Failed to save event')
		}
	}
}
