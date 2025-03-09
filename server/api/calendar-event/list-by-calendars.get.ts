import {ICalendarEvent} from '~/interfaces'

export default defineEventHandler(async (event) => {
	const {calendarsIds, endDate, startDate} = getQuery(event) as {
		calendarsIds: number[]
		startDate: Date
		endDate: Date
	}

	try {
		const sql = `
            SELECT event.*, calendar.color
            FROM calendar_event event
            LEFT JOIN calendar calendar ON event.calendarId = calendar.id
            WHERE event.calendarId IN (${calendarsIds}) 
            AND event.deleted = 0

        `

		const data = await getData<ICalendarEvent[]>(sql)

		return data
	} catch (error) {
		throw createError({
			status: 500,
			message: 'Error to get events by calendars',
		})
	}
})
