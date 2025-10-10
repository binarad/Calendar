import sqlite3 from 'sqlite3'
import { open, type Database } from 'sqlite'
import path from 'path'

export class DB {
	private static instance: Promise<Database> | null = null

	static get(): Promise<Database> {
		if (!DB.instance) {
			const file = path.resolve(__dirname, '../../callendar.db')
			DB.instance = open({ filename: file, driver: sqlite3.Database }).then(
				async db => {
					await db.exec(`
          PRAGMA foreign_keys=ON;
          CREATE TABLE IF NOT EXISTS RecurrenceRule (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            freq TEXT NOT NULL,
            interval INTEGER DEFAULT 1,
            byday TEXT,
            until TEXT,
            count INTEGER
          );

          CREATE TABLE IF NOT EXISTS Event (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            startTime TEXT NOT NULL,
            endTime TEXT,
            recurrenceRuleId INTEGER,
            createdAt TEXT DEFAULT (datetime('now')),
            updatedAt TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (recurrenceRuleId) REFERENCES RecurrenceRule(id) ON DELETE SET NULL
          );

          CREATE TABLE IF NOT EXISTS Reminder (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            eventId INTEGER NOT NULL,
            minutesBefore INTEGER NOT NULL DEFAULT 10,
            createdAt TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (eventId) REFERENCES Event(id) ON DELETE CASCADE
          );
        `)
					return db
				}
			)
		}
		return DB.instance
	}
}
