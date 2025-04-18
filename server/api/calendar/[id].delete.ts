export default defineEventHandler(async (event) => {
	const id = getRouterParam(event, 'id')

	try {
		await deleteData('calendar', Number(id))

		return new Response(null, {status: 200})
	} catch (error) {
		throw createError({
			status: 500,
			message: 'Error to delete calendar',
		})
	}
})
