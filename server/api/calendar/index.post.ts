import {ICalendar} from '~/interfaces'
import {insertData} from '~/server/utils/data'

export default defineEventHandler(async (event) => {
	const body = await readBody<ICalendar>(event)

	try {
		await insertData('calendar', body)

		return new Response(null, {status: 201})
	} catch (error) {
		throw createError({
			status: 500,
			message: 'Error to create calendar',
		})
	}
})
