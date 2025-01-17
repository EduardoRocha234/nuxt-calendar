import {IUser} from '~/interfaces'
import {database} from '~/server/utils/db'

export default defineEventHandler(async () => {
	try {
		return new Promise<IUser[]>((resolve, reject) => {
            const sql = 'SELECT * FROM user'
			database.all(sql, (err, rows) => {
				if (err) {
					reject(err)
				} else {
					return resolve(rows as IUser[])
				}
			})
		})
	} catch (error) {
		throw createError({
			status: 500,
			message: 'Error to get users',
		})
	}
})
