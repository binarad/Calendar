import React from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type {
	DateSelectArg,
	EventApi,
	EventClickArg,
	EventInput,
	EventSourceFuncArg,
	EventDropArg,
} from '@fullcalendar/core'

import EventContent from './EventContent'

type CalendarProps = {
	fetchEvents: (
		info: EventSourceFuncArg,
		successCallback: (events: EventInput[]) => void,
		failureCallback: (error: Error) => void
	) => void
	handleEventClick: (arg: EventClickArg) => void
	handleEvents: (events: EventApi[]) => void
	handleEventDrop: (dropInfo: EventDropArg) => void
	handleDateSelect: (selectInfo: DateSelectArg) => void
	ref: React.Ref<FullCalendar>
}

export const Calendar = ({
	fetchEvents,
	handleEventClick,
	handleEvents,
	handleDateSelect,
	handleEventDrop,
	ref,
}: CalendarProps) => {
	return (
		<FullCalendar
			ref={ref}
			plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
			headerToolbar={{
				left: 'prev,next today',
				center: 'title',
				right: 'dayGridMonth,timeGridWeek,timeGridDay',
			}}
			initialView='dayGridMonth'
			editable
			selectable
			selectMirror
			dayMaxEvents
			events={fetchEvents}
			select={handleDateSelect}
			eventContent={EventContent}
			eventClick={handleEventClick}
			eventsSet={handleEvents}
			eventDrop={handleEventDrop}
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
	)
}
