import {ICalendar} from '~/interfaces'
import {z} from 'zod'

const schema = z.object({
	userId: z.string().transform((val) => Number(val)),
})

export default defineEventHandler(async (event) => {
	const {data} = await getValidatedQuery(event, schema.safeParse)

	try {
		const sql = 'SELECT * FROM calendar WHERE deleted = 0'

		const response = await getData<ICalendar[]>(sql)

		const userCalendars = response.filter(
			(calendar) => calendar.userId === data?.userId
		)
		const othersCalendars = response.filter(
			(calendar) => calendar.userId !== data?.userId
		)

		return {
			userCalendars,
			othersCalendars,
		}
	} catch (error) {
		console.log(error)
		throw createError({
			status: 500,
			message: 'Error to found calendars',
		})
	}
})
