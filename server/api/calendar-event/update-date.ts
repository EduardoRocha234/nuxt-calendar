import {ICalendarEvent} from '~/interfaces'

export default defineEventHandler(async (event) => {
	const body = await readBody<
		Pick<ICalendarEvent, 'id' | 'startDate' | 'endDate'>
	>(event)

	try {
		await updateData('calendar_event', Number(body.id), body)

		return new Response(null, {status: 200})
	} catch (error) {
		throw createError({
			status: 500,
			message: 'Error to update event',
		})
	}
})
