import { useState } from 'react'
import type { EventApi } from '@fullcalendar/core'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

import { handleDateSelect } from './callbacks/handleDateSelect'
import { Sidebar } from './components/Sidebar'
import EventContent from './components/EventContent'
import { useCalendarHandlers } from './hooks/useCalendarHandlers'
import type { Reminder, SelectedEvent } from './types'

export default function DemoApp() {
	const [currentEvents, setCurrentEvents] = useState<EventApi[]>([])
	const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(null)
	const [selectedReminders, setSelectedReminders] = useState<Reminder[]>([])
	const [selectedOccurrences, setSelectedOccurrences] = useState<string[]>([])
	const [selectedOccurrence, setSelectedOccurrence] = useState<string | null>(
		null
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
	} = useCalendarHandlers({
		selectedEvent,
		selectedOccurrence,
		setCurrentEvents,
		setSelectedEvent,
		setSelectedReminders,
		setSelectedOccurrences,
		setSelectedOccurrence,
	})

	return (
		<div className='app'>
			<div className='app-main'>
				<FullCalendar
					plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
					headerToolbar={{
						left: 'prev,next today',
						center: 'title',
						right: 'dayGridMonth,timeGridWeek,timeGridDay',
					}}
					initialView='dayGridMonth'
					editable={true}
					selectable={true}
					selectMirror={true}
					dayMaxEvents={true}
					events={fetchEvents}
					select={handleDateSelect}
					eventContent={EventContent}
					eventClick={handleEventClick}
					eventsSet={handleEvents}
					slotLabelFormat={{
						hour: '2-digit',
						minute: '2-digit',
						hour12: false,
					}}
					eventTimeFormat={{
						hour: '2-digit',
						minute: '2-digit',
						hour12: false,
					}}
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
		</div>
	)
}
