import type { Database } from 'sqlite'
import { DB } from '../core/Database'

export abstract class BaseModel {
	protected dbPromise: Promise<Database>

	constructor() {
		this.dbPromise = DB.get()
	}
}
