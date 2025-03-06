import type {IUser} from '~/interfaces'

export default defineEventHandler(async (event) => {
	const id = getRouterParam(event, 'id')

	try {
		const sql = `SELECT * FROM user WHERE id = ${id}`
		const data = await getData<IUser[]>(sql)

		return data[0]
	} catch (error) {
		throw createError({
			status: 500,
			message: 'Error to get users',
		})
	}
})
