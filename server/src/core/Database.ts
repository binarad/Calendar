import Database from 'better-sqlite3'
import path from 'path'

export class DB {
	private static instance: Database.Database

	static get(): Database.Database {
		if (!DB.instance) {
			const file = path.resolve(__dirname, '../../controller.db')
			DB.instance = new Database(file)
			DB.instance.pragma('foreign_keys=ON')
			DB.instance.exec(`
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
		}
		return DB.instance
	}
}
