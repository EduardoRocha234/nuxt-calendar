import { ICalendar } from '~/interfaces'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    try {
        const sql = `SELECT id, name, description, color, userId FROM calendar WHERE id = ${id}`
        const data = await getData<ICalendar[]>(sql)

        return data[0]
    } catch (error) {
        throw createError({
            status: 500,
            message: 'Error to get calendar',
        })
    }
})
