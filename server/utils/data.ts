import {Tables} from './db'

export const getData = <T>(sql: string): Promise<T> => {
	return new Promise<T>((resolve, reject) => {
		database.all(sql, (err, rows) => {
			if (err) {
				reject(err)
				return
			}

			resolve(rows as T)
		})
	})
}

export const insertData = (table: Tables, data: Record<string, any>) => {
	return new Promise((resolve, reject) => {
		const keys = Object.keys(data).join(', ')
		const values = Object.values(data)
			.map((value) => (typeof value === 'string' ? `'${value}'` : value))
			.join(', ')

		const query = `INSERT INTO ${table} (${keys}) VALUES (${values})`

		console.log(query)

		database.run(query, function (err) {
			if (err) {
				reject(err)
			} else {
				resolve(this.lastID)
			}
		})
	})
}

export const deleteData = (table: Tables, id: number): Promise<void> => {
	return new Promise<void>((resolve, reject) => {
		const query = `DELETE FROM ${table} WHERE id = ${id}`

		database.run(query, function (err) {
			if (err) {
				reject(err)
			} else {
				resolve()
			}
		})
	})
}
