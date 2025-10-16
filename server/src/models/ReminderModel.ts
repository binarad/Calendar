import { BaseModel } from './BaseModel'

export interface ReminderData {
	id?: number
	eventId: number
	minutesBefore: number
}

export class ReminderModel extends BaseModel {
	async create(rem: ReminderData): Promise<ReminderData> {
		const db = await this.dbPromise
		const res = await db.run(
			`INSERT INTO Reminder ( eventId, minutesBefore) VALUES (?, ?)`,
			rem.eventId,
			rem.minutesBefore
		)
		return { id: Number(res.lastID), ...rem }
	}

	async getByEvent(eventId: number): Promise<ReminderData[]> {
		const db = await this.dbPromise
		return db.all<ReminderData[]>(
			'SELECT * FROM Reminder WHERE eventId = ?',
			eventId
		)
	}

	async deleteByEvent(eventId: number): Promise<void> {
		const db = await this.dbPromise
		await db.run('DELETE FROM Reminder WHERE eventId = ?', eventId)
	}

	async deleteByReminderID(eventId: number, reminderId: number) {
		const db = await this.dbPromise
		await db.run(
			'DELETE FROM Reminder WHERE eventId = ? and id = ?',
			eventId,
			reminderId
		)
	}
}
