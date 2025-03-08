import { ICalendarEvent } from '~/interfaces'

export default defineEventHandler(async (event) => {
	const id = getRouterParam(event, 'id')

	try {
		const sql = `SELECT * FROM calendar_event WHERE id = ${id}`
		const data = await getData<ICalendarEvent[]>(sql)

		return data[0]
	} catch (error) {
		throw createError({
			status: 500,
			message: 'Error to get event',
		})
	}
})
