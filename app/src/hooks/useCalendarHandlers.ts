import { useCallback } from 'react'
import type { EventApi, EventClickArg, EventDropArg } from '@fullcalendar/core'
import { createFetchEvents } from '../services/events'
import { fetchEventDetails } from '../services/eventDetails'
import { addReminder, deleteReminder } from '../services/reminders'
import {
	deleteEvent as deleteEventApi,
	updateEvent,
} from '../services/eventsMutations'
import type { Reminder, SelectedEvent } from '../types'
import FullCalendar from '@fullcalendar/react'

type Params = {
	selectedEvent: SelectedEvent | null
	selectedOccurrence: string | null
	setCurrentEvents: (events: EventApi[]) => void
	setSelectedEvent: (e: SelectedEvent | null) => void
	setSelectedReminders: (r: Reminder[]) => void
	setSelectedOccurrences: (o: string[]) => void
	setSelectedOccurrence: (o: string | null) => void
	onOpenEditModal?: () => void
	calendarRef: React.RefObject<FullCalendar | null>
}

export function useCalendarHandlers({
	selectedEvent,
	selectedOccurrence,
	setCurrentEvents,
	setSelectedEvent,
	setSelectedReminders,
	setSelectedOccurrences,
	setSelectedOccurrence,
	onOpenEditModal,
	calendarRef,
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

		onOpenEditModal?.()
	}, [selectedEvent, onOpenEditModal])

	const handleDeleteEvent = useCallback(async () => {
		if (!selectedEvent) return

		const confirmed = window.confirm(
			'Are you sure you want to delete this event series?'
		)
		if (!confirmed) return
		try {
			await deleteEventApi(selectedEvent.id)
			setSelectedEvent(null)
			setSelectedReminders([])
			setSelectedOccurrences([])
			setSelectedOccurrence(null)

			calendarRef.current?.getApi().refetchEvents()
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
		calendarRef,
	])

	const handleEventDrop = useCallback(async (dropInfo: EventDropArg) => {
		try {
			await updateEvent(Number(dropInfo.event.id), {
				startTime: dropInfo.event.startStr,
				endTime: dropInfo.event.endStr,
			})

			console.log(`Event with ID: ${dropInfo.event.id} updated successfully`)
		} catch (e: any) {
			console.error(e)
			alert(`Failed to update event: ${e.message}`)
			dropInfo.revert()
		}
	}, [])
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
		handleEventDrop,
	}
}
