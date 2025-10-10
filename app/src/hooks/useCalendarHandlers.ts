import { useCallback } from 'react'
import type { EventApi, EventClickArg } from '@fullcalendar/core'
import { createFetchEvents } from '../services/events'
import { fetchEventDetails } from '../services/eventDetails'
import { addReminder, deleteReminder } from '../services/reminders'
import {
	updateEvent,
	deleteEvent as deleteEventApi,
} from '../services/eventsMutations'
import type { Reminder, SelectedEvent } from '../types'

type Params = {
	selectedEvent: SelectedEvent | null
	selectedOccurrence: string | null
	setCurrentEvents: (events: EventApi[]) => void
	setSelectedEvent: (e: SelectedEvent | null) => void
	setSelectedReminders: (r: Reminder[]) => void
	setSelectedOccurrences: (o: string[]) => void
	setSelectedOccurrence: (o: string | null) => void
}

export function useCalendarHandlers({
	selectedEvent,
	selectedOccurrence,
	setCurrentEvents,
	setSelectedEvent,
	setSelectedReminders,
	setSelectedOccurrences,
	setSelectedOccurrence,
}: Params) {
	const fetchEvents = useCallback(createFetchEvents(), [])

	const handleEventClick = useCallback(
		async (clickInfo: EventClickArg) => {
			try {
				const idNum = Number(clickInfo.event.id)
				const details = await fetchEventDetails(idNum)
				setSelectedEvent(details.selectedEvent)
				setSelectedReminders(details.selectedReminders)
				setSelectedOccurrences(details.selectedOccurrences)
				setSelectedOccurrence(null)
			} catch (e) {
				console.error(e)
			}
		},
		[
			setSelectedEvent,
			setSelectedReminders,
			setSelectedOccurrences,
			setSelectedOccurrence,
		]
	)

	const handleAddReminder = useCallback(
		async (minutesBefore: number) => {
			if (!selectedEvent) return
			try {
				const updated = await addReminder(selectedEvent.id, minutesBefore)
				setSelectedReminders(updated)
			} catch (e) {
				console.error(e)
			}
		},
		[selectedEvent, setSelectedReminders]
	)

	const handleDeleteReminder = useCallback(
		async (minutesBefore: number) => {
			if (!selectedEvent) return
			try {
				const updated = await deleteReminder(selectedEvent.id, minutesBefore)
				setSelectedReminders(updated)
			} catch (e) {
				console.error(e)
			}
		},
		[selectedEvent, setSelectedReminders]
	)

	const handleSelectOccurrence = useCallback(
		(occurrenceIso: string) => {
			setSelectedOccurrence(occurrenceIso || null)
		},
		[setSelectedOccurrence]
	)

	const handleEditEvent = useCallback(async () => {
		if (!selectedEvent) return
		const scope = selectedOccurrence
			? prompt(
					'Edit this occurrence or the whole series? (type: occurrence/series)',
					'series'
			  )
			: 'series'
		if (!scope) return
		if (scope !== 'series' && scope !== 'occurrence') return
		if (scope === 'occurrence') {
			alert(
				'Editing a single occurrence is not supported by the backend yet. Will update the series instead.'
			)
		}
		const newTitle = prompt('Title', selectedEvent.title) ?? selectedEvent.title
		const newDescription = prompt(
			'Description',
			selectedEvent.description ?? ''
		)
		const newStart =
			prompt('Start ISO (YYYY-MM-DDTHH:mm:ssZ)', selectedEvent.startTime) ??
			selectedEvent.startTime
		const newEnd = prompt('End ISO (optional)', selectedEvent.endTime ?? '')
		try {
			const updated = await updateEvent(selectedEvent.id, {
				title: newTitle,
				description:
					newDescription && newDescription.trim() !== ''
						? newDescription
						: null,
				startTime: newStart,
				endTime: newEnd && newEnd.trim() !== '' ? newEnd : null,
			})
			setSelectedEvent(updated)
		} catch (e) {
			console.error(e)
		}
	}, [selectedEvent, selectedOccurrence, setSelectedEvent])

	const handleDeleteEvent = useCallback(async () => {
		if (!selectedEvent) return
		const scope = selectedOccurrence
			? prompt(
					'Delete this occurrence or the whole series? (type: occurrence/series)',
					'series'
			  )
			: 'series'
		if (!scope) return
		if (scope !== 'series' && scope !== 'occurrence') return
		if (scope === 'occurrence') {
			alert(
				'Deleting a single occurrence is not supported by the backend yet. Will delete the series instead.'
			)
		}
		try {
			await deleteEventApi(selectedEvent.id)
			setSelectedEvent(null)
			setSelectedReminders([])
			setSelectedOccurrences([])
			setSelectedOccurrence(null)
		} catch (e) {
			console.error(e)
		}
	}, [
		selectedEvent,
		selectedOccurrence,
		setSelectedEvent,
		setSelectedReminders,
		setSelectedOccurrences,
		setSelectedOccurrence,
	])

	const handleEvents = useCallback(
		(events: EventApi[]) => {
			setCurrentEvents(events)
		},
		[setCurrentEvents]
	)

	return {
		fetchEvents,
		handleEventClick,
		handleAddReminder,
		handleDeleteReminder,
		handleSelectOccurrence,
		handleEditEvent,
		handleDeleteEvent,
		handleEvents,
	}
}
