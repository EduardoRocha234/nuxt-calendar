import type {IUser} from '~/interfaces'

export default defineEventHandler(async () => {
	try {
            const sql = 'SELECT * FROM user'
			const data = await getData<IUser[]>(sql)

			return data
	} catch (error) {
		throw createError({
			status: 500,
			message: 'Error to get users',
		})
	}
})
