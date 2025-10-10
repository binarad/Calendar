import { EventEmitter } from 'events'

export class NotificationCenter extends EventEmitter {
	// singleton

	private static instance: NotificationCenter
	private constructor() {
		super()
	}

	static getInstance(): NotificationCenter {
		if (!NotificationCenter.instance)
			NotificationCenter.instance = new NotificationCenter()

		return NotificationCenter.instance
	}

	notifyReminder(payload: {
		eventId: number
		when: string
		minutesBefore: number
	}) {
		this.emit('reminder', payload)
	}
}
