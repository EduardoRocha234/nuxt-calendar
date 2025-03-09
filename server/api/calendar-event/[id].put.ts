import {ICalendarEvent} from '~/interfaces'

export default defineEventHandler(async (event) => {
	const id = getRouterParam(event, 'id')
	const body = await readBody<ICalendarEvent>(event)

	try {
		await updateData('calendar_event', Number(id), body)

		return new Response(null, {status: 200})
	} catch (error) {
		throw createError({
			status: 500,
			message: 'Error to update event',
		})
	}
})
