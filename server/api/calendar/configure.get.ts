import {ICalendar} from '~/interfaces'
import {z} from 'zod'

const schema = z.object({
	userId: z.string().transform((val) => Number(val)),
})

export default defineEventHandler(async (event) => {
	const {data} = await getValidatedQuery(event, schema.safeParse)

	try {
		const sql = 'SELECT * FROM calendar'

		const response = await getData<ICalendar[]>(sql)
		console.log(typeof data?.userId)

		const userCalendars = response.filter(
			(calendar) => calendar.userId === data?.userId
		)
		const othersCalendars = response.filter(
			(calendar) => calendar.userId !== data?.userId
		)

		console.log(userCalendars)

		return {
			userCalendars,
			othersCalendars,
		}
	} catch (error) {
		console.log(error)
		throw createError({
			status: 500,
			message: 'Error to get users',
		})
	}
})
