import type { EventInput, EventSourceFuncArg } from '@fullcalendar/core'

export function createFetchEvents(): (
	info: EventSourceFuncArg,
	successCallback: (events: EventInput[]) => void,
	failureCallback: (error: Error) => void
) => void {
	return function fetchEvents(
		_info: EventSourceFuncArg,
		successCallback: (events: EventInput[]) => void,
		failureCallback: (error: Error) => void
	): void {
		void (async () => {
			try {
				const res = await fetch('/api/events')
				if (!res.ok) throw new Error('Failed to load events')
				const data: Array<{
					id: number
					title: string
					startTime: string
					endTime?: string | null
				}> = await res.json()
				successCallback(
					data.map(e => ({
						id: String(e.id),
						title: e.title,
						start: e.startTime,
						end: e.endTime ?? undefined,
					}))
				)
			} catch (e) {
				console.error(e)
				const err = e instanceof Error ? e : new Error(String(e))
				failureCallback(err)
			}
		})()
	}
}


