import sqlite3 from 'sqlite3'

const {Database} = sqlite3
const db = new Database(':memory:')

function createTables() {
	return new Promise<void>((resolve, reject) => {
		db.serialize(() => {
			db.run(
				`
                CREATE TABLE user (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    userName TEXT NOT NULL,
                    fullName TEXT NOT NULL,
                    email TEXT NOT NULL,
                    avatar TEXT
                );
            `,
				(err) => {
					if (err) return reject(err)
				}
			)

			db.run(
				`
                CREATE TABLE calendar (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    userId INTEGER NOT NULL,
                    name TEXT NOT NULL,
                    description TEXT,
                    color TEXT NOT NULL,
                    FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE
                );
            `,
				(err) => {
					if (err) return reject(err)
				}
			)

			db.run(
				`
                CREATE TABLE calendar_event (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    calendarId INTEGER NOT NULL,
                    priority TEXT NOT NULL,
                    userId INTEGER NOT NULL,
                    name TEXT NOT NULL,
                    description TEXT,
                    startDate DATETIME NOT NULL,
                    endDate DATETIME NOT NULL,
                    notify BOOLEAN NOT NULL,
                    allDay BOOLEAN NOT NULL,
                    recurrencyRule TEXT,
                    guestsIds TEXT,
                    FOREIGN KEY (calendarId) REFERENCES calendar(id) ON DELETE CASCADE ON UPDATE CASCADE,
                    FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE
                );
            `,
				(err) => {
					if (err) return reject(err)
				}
			)

			resolve()
		})
	})
}

function insertData() {
	return new Promise<void>((resolve, reject) => {
		db.serialize(() => {
			db.run(
				'INSERT INTO user (userName, fullName, email, avatar) VALUES (?, ?, ?, ?)',
				[
					'alice123',
					'Alice Johnson',
					'alice@example.com',
					'https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/http%3A%2F%2Fplacekitten.com%2F250%2F250',
				]
			)

			db.run(
				'INSERT INTO user (userName, fullName, email, avatar) VALUES (?, ?, ?, ?)',
				[
					'bob456',
					'Bob Smith',
					'bob@example.com',
					'http://placebeard.it/223/150?5',
				]
			)

			db.run(
				'INSERT INTO calendar (userId, name, description, color) VALUES (?, ?, ?, ?)',
				[1, 'Work Calendar', 'Calendar for work-related events', '#FF0000']
			)

			db.run(
				'INSERT INTO calendar (userId, name, description, color) VALUES (?, ?, ?, ?)',
				[1, 'Personal Calendar', 'Calendar for personal events', '#00FF00']
			)

			db.run(
				'INSERT INTO calendar_event (calendarId, priority, userId, name, description, startDate, endDate, notify, allDay, recurrencyRule, guestsIds) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
				[
					1,
					'High',
					1,
					'Project Meeting',
					'Discuss project milestones',
					new Date().toISOString(),
					new Date().toISOString(),
					1,
					0,
					null,
					'1,2',
				]
			)

			db.run(
				'INSERT INTO calendar_event (calendarId, priority, userId, name, description, startDate, endDate, notify, allDay, recurrencyRule, guestsIds) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
				[
					2,
					'Medium',
					2,
					'Doctor Appointment',
					'Routine check-up',
					new Date().toISOString(),
					new Date().toISOString(),
					1,
					0,
					null,
					'2',
				]
			)

			resolve()
		})
	})
}

;(async () => {
	try {
		await createTables()
		console.log('Tabelas criadas com sucesso.')
		await insertData()
		console.log('Dados inseridos com sucesso.')
		// await queryData()
		// console.log('Consulta finalizada.')
	} catch (err) {
		console.error('Erro durante a execução:', err)
	}
})()

export type Tables = 'user' | 'calendar' | 'calendar_event'
export const database = db
