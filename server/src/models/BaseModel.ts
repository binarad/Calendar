import type Database from 'better-sqlite3'
import { DB } from '../core/Database'

export abstract class BaseModel {
	protected db: Database.Database

	constructor() {
		this.db = DB.get()
	}
}
