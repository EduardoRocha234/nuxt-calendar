// Criar tabela e manipular dados
import sqlite3 from 'sqlite3'

// Configurar SQLite com verbose (opcional para depuração)
const {Database} = sqlite3

// Criar banco de dados em memória
const db = new Database(':memory:')

// Função para criar tabelas
function createTables() {
	return new Promise<void>((resolve, reject) => {
		db.serialize(() => {
			db.run(
				`
                CREATE TABLE user (
                    id TEXT PRIMARY KEY NOT NULL,
                    userName TEXT NOT NULL,
                    fullName TEXT NOT NULL,
                    email TEXT NOT NULL,
                    avatar TEXT NOT NULL
                );
            `,
				(err) => {
					if (err) return reject(err)
				}
			)

			db.run(
				`
                CREATE TABLE calendar (
                    id TEXT PRIMARY KEY NOT NULL,
                    userId TEXT NOT NULL,
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
                    id TEXT PRIMARY KEY NOT NULL,
                    calendarId TEXT NOT NULL,
                    priority TEXT NOT NULL,
                    userId TEXT NOT NULL,
                    name TEXT NOT NULL,
                    description TEXT,
                    startDate DATETIME NOT NULL,
                    endDate DATETIME NOT NULL,
                    notify BOOLEAN NOT NULL,
                    allDay BOOLEAN NOT NULL,
                    recurrencyRule TEXT,
                    FOREIGN KEY (calendarId) REFERENCES calendar(id) ON DELETE CASCADE ON UPDATE CASCADE
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

// Função para inserir dados
function insertData() {
	return new Promise<void>((resolve, reject) => {
		db.serialize(() => {
			db.run(
				'INSERT INTO user (id, userName, fullName, email, avatar) VALUES (?, ?, ?, ?, ?)',
				[
					'1',
					'alice123',
					'Alice Johnson',
					'alice@example.com',
					'https://example.com/avatars/alice.png',
				]
			)

			db.run(
				'INSERT INTO user (id, userName, fullName, email, avatar) VALUES (?, ?, ?, ?, ?)',
				[
					'2',
					'bob456',
					'Bob Smith',
					'bob@example.com',
					'https://example.com/avatars/bob.png',
				]
			)

			db.run(
				'INSERT INTO calendar (id, userId, name, description, color) VALUES (?, ?, ?, ?, ?)',
				[
					'1',
					'1',
					'Work Calendar',
					'Calendar for work-related events',
					'#FF0000',
				]
			)

			db.run(
				'INSERT INTO calendar (id, userId, name, description, color) VALUES (?, ?, ?, ?, ?)',
				[
					'2',
					'2',
					'Personal Calendar',
					'Calendar for personal events',
					'#00FF00',
				]
			)

			db.run(
				'INSERT INTO calendar_event (id, calendarId, priority, userId, name, description, startDate, endDate, notify, allDay, recurrencyRule) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
				[
					'1',
					'1',
					'High',
					'1',
					'Project Meeting',
					'Discuss project milestones',
					'2025-01-16T10:00:00',
					'2025-01-16T11:00:00',
					1,
					0,
					null,
				]
			)

			db.run(
				'INSERT INTO calendar_event (id, calendarId, priority, userId, name, description, startDate, endDate, notify, allDay, recurrencyRule) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
				[
					'2',
					'2',
					'Medium',
					'2',
					'Doctor Appointment',
					'Routine check-up',
					'2025-01-17T14:00:00',
					'2025-01-17T15:00:00',
					1,
					0,
					null,
				]
			)

			resolve()
		})
	})
}

// Função para consultar dados
function queryData() {
	return new Promise<void>((resolve, reject) => {
		db.serialize(() => {
			db.all('SELECT * FROM user', (err, rows) => {
				if (err) return reject(err)
				console.log('Usuários:', rows)
			})

			db.all('SELECT * FROM calendar', (err, rows) => {
				if (err) return reject(err)
				console.log('Calendários:', rows)
			})

			db.all('SELECT * FROM calendar_event', (err, rows) => {
				if (err) return reject(err)
				console.log('Eventos do calendário:', rows)
			})

			resolve()
		})
	})
}

// Executar funções em sequência
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

export const database = db

// Fechar banco ao encerrar
// db.close((err) => {
// 	if (err) {
// 		console.error('Erro ao fechar o banco:', err)
// 	} else {
// 		console.log('Banco encerrado.')
// 	}
// })
