import { BaseModel } from './BaseModel'

export interface EventData {
	id?: number
	title: string
	description?: string
	startTime: string
	endTime?: string | null
	recurrenceRuleId?: number | null
}

export class EventModel extends BaseModel {
	async create(event: EventData): Promise<EventData> {
		const db = await this.dbPromise
		const res = await db.run(
			`INSERT INTO Event (title, description, startTime, endTime, recurrenceRuleId)
	        VALUES (?, ?, ?, ?, ?)`,
			event.title,
			event.description ?? null,
			event.startTime,
			event.endTime ?? null,
			event.recurrenceRuleId ?? null
		)
		return { id: Number(res.lastID), ...event }
	}

	async getAll(): Promise<EventData[]> {
		const db = await this.dbPromise
		return db.all<EventData[]>('SELECT * FROM Event ORDER BY startTime ASC')
	}

	async getById(id: number): Promise<EventData | undefined> {
		const db = await this.dbPromise
		return (
			(await db.get<EventData>('SELECT * FROM Event WHERE id = ?', id)) ??
			undefined
		)
	}

	async update(id: number, updates: Partial<EventData>): Promise<EventData> {
		const existing = await this.getById(id)
		if (!existing) throw new Error('Event not found')
		const merged = { ...existing, ...updates }
		const db = await this.dbPromise
		await db.run(
			`UPDATE Event SET title = ?, description = ?, startTime = ?, endTime = ?, recurrenceRuleId = ?, updatedAt = datetime('now')
	      WHERE id = ?`,
			merged.title,
			merged.description ?? null,
			merged.startTime,
			merged.endTime ?? null,
			merged.recurrenceRuleId ?? null,
			id
		)
		return merged
	}

	async delete(id: number): Promise<void> {
		const db = await this.dbPromise
		await db.run('DELETE FROM Event WHERE id = ?', id)
	}
}
