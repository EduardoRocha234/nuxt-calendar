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
