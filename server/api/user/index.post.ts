import type {IUser} from '~/interfaces'
import {insertData} from '~/server/utils/data'

const generateUserName = (fullName: string) => {
	const fullNameSplit = fullName.split(' ').map((n) => n.toLocaleLowerCase())

	if (fullNameSplit.length <= 1) return fullName.toLocaleLowerCase()

	const [firstName, lastName] = fullNameSplit

	return `${firstName}.${lastName}`
}

export default defineEventHandler(async (event) => {
	const body = await readBody<Pick<IUser, 'fullName' | 'email'>>(event)

	const fullUser: Omit<IUser, 'id'> = {
		avatar: '',
		email: body.email,
		fullName: body.fullName,
		userName: generateUserName(body.fullName),
	}

	try {
		const newUserId = await insertData('user', fullUser)

		return await $fetch(`/api/user/${newUserId}`)
	} catch (error) {
		throw createError({
			status: 500,
			message: 'Error to get users',
		})
	}
})
