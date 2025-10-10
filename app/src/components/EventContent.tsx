import type { EventContentArg } from '@fullcalendar/core'

export default function EventContent(eventContent: EventContentArg) {
	return (
		<>
			<b>{eventContent.timeText}</b>
			<i>{eventContent.event.title}</i>
		</>
	)
}
