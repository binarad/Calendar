import { BaseModel } from './BaseModel'

export interface RecurrenceRuleData {
	id?: number
	freq: 'DAILY' | 'WEEKLY' | 'MONTHLY'
	interval?: number
	byday?: string | null // "Mon, Tue"
	until?: string | null
	count?: number | null
}

export class RecurrenceRuleModel extends BaseModel {
	async create(rule: RecurrenceRuleData): Promise<RecurrenceRuleData> {
		const db = await this.dbPromise
		const res = await db.run(
			`INSERT INTO RecurrenceRule (freq, interval, byday, until, count)
	        VALUES (?, ?, ?, ?, ?)`,
			rule.freq,
			rule.interval ?? 1,
			rule.byday ?? null,
			rule.until ?? null,
			rule.count ?? null
		)

		return { id: Number(res.lastID), ...rule }
	}

	async getById(id: number): Promise<RecurrenceRuleData | undefined> {
		const db = await this.dbPromise
		return (
			(await db.get<RecurrenceRuleData>(
				'SELECT * FROM RecurrenceRule WHERE id = ?',
				id
			)) ?? undefined
		)
	}
}
