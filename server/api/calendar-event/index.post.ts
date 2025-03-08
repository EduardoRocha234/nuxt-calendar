import {ICalendarEvent} from '~/interfaces'
import {z} from 'zod'
import {insertData} from '~/server/utils/data'

export default defineEventHandler(async (event) => {
	const body = await readBody<ICalendarEvent>(event)

	try {
		await insertData('calendar_event', body)

		return new Response(null, {status: 201})
	} catch (error) {
		console.log(error)
		throw createError({
			status: 500,
			message: 'Error to create event',
		})
	}
})
