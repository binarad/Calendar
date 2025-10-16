import { useState, useCallback, useRef } from 'react'
import type { EventApi, DateSelectArg } from '@fullcalendar/core'
import { Sidebar } from './components/Sidebar'
import { useCalendarHandlers } from './hooks/useCalendarHandlers'
import type { Reminder, SelectedEvent } from './types'
import { Calendar } from './components/Calendar'
import EventModal, { type EventFormData } from './components/EventModal'
import { createEvent, updateEvent } from './services/eventsMutations'
import FullCalendar from '@fullcalendar/react' // Needed for the ref type

export default function App() {
	const [currentEvents, setCurrentEvents] = useState<EventApi[]>([])
	const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(null)
	const [selectedReminders, setSelectedReminders] = useState<Reminder[]>([])
	const [selectedOccurrences, setSelectedOccurrences] = useState<string[]>([])
	const [selectedOccurrence, setSelectedOccurrence] = useState<string | null>(
		null
	)

	// State for the Modal
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
	const [modalInitialData, setModalInitialData] =
		useState<Partial<EventFormData> | null>(null)

	const calendarRef = useRef<FullCalendar>(null)

	const handleCloseModal = () => {
		setIsModalOpen(false)
		setModalInitialData(null)
	}

	const handleOpenCreateModal = useCallback((selectInfo: DateSelectArg) => {
		selectInfo.view.calendar.unselect() // Clear date selection
		setModalInitialData({
			startTime: selectInfo.startStr,
			endTime: selectInfo.endStr,
		})
		setIsModalOpen(true)
	}, [])

	const handleOpenEditModal = useCallback(() => {
		if (!selectedEvent) return
		setModalInitialData(selectedEvent)
		setIsModalOpen(true)
	}, [selectedEvent])

	const handleSaveEvent = useCallback(
		async (data: EventFormData) => {
			try {
				if (selectedEvent) {
					const updated = await updateEvent(selectedEvent.id, data)
					setSelectedEvent(updated)
				} else {
					await createEvent(data)
				}
				handleCloseModal()
				calendarRef.current?.getApi().refetchEvents()
			} catch (e: any) {
				console.error(e)
				alert(`Failed to save event: ${e.message}`)
			}
		},
		[selectedEvent]
	)
	const {
		fetchEvents,
		handleEventClick,
		handleAddReminder,
		handleDeleteReminder,
		handleSelectOccurrence,
		handleEditEvent,
		handleDeleteEvent,
		handleEvents,
		handleEventDrop,
	} = useCalendarHandlers({
		selectedEvent,
		selectedOccurrence,
		setCurrentEvents,
		setSelectedEvent,
		setSelectedReminders,
		setSelectedOccurrences,
		setSelectedOccurrence,
		onOpenEditModal: handleOpenEditModal,
		calendarRef: calendarRef,
	})

	// Notification.requestPermission().then(result => {
	// 	console.log(result)
	// })
	// Notification example
	// const img = './assets/react.svg'
	// const notification = new Notification('HELLO', { body: "WASH YOUR ASS", icon: img})

	return (
		<div className='app'>
			<div className='app-main'>
				<Calendar
					ref={calendarRef}
					fetchEvents={fetchEvents}
					handleEventClick={handleEventClick}
					handleEvents={handleEvents}
					handleDateSelect={handleOpenCreateModal}
					handleEventDrop={handleEventDrop}
				/>
			</div>
			<Sidebar
				currentEvents={currentEvents}
				selectedEvent={selectedEvent}
				selectedReminders={selectedReminders}
				selectedOccurrences={selectedOccurrences}
				selectedOccurrence={selectedOccurrence}
				onAddReminder={handleAddReminder}
				onDeleteReminder={handleDeleteReminder}
				onSelectOccurrence={handleSelectOccurrence}
				onEditEvent={handleEditEvent}
				onDeleteEvent={handleDeleteEvent}
			/>
			<EventModal
				open={isModalOpen}
				initialData={modalInitialData}
				onClose={handleCloseModal}
				onSave={handleSaveEvent}
			/>
		</div>
	)
}
