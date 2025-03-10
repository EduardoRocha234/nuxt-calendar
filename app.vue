<template>
	<div >
		<Dialog
			v-model:visible="modalVisible"
			header="Hello! Good to see you here"
			:style="{width: '25rem'}"
			position="top"
			modal
			:draggable="false"
			:closable="false"
		>
			<span class="text-surface-500 block mb-1"
				>Type some infos to use this calendar</span
			>
			<span class="text-green-800 text-xs block mb-8"
				>No information on this website is stored permanently in a database!
				Only in memory.</span
			>
			<div class="w-full mb-6">
				<AppInputText
					id="fullname"
					v-model="newUser.fullName"
					label="Fullname"
					:error="getError('fullName')"
					required
				/>
			</div>
			<div class="w-full mb-8">
				<AppInputText
					id="email"
					v-model="newUser.email"
					label="email"
					:error="getError('email')"
					required
				/>
			</div>
			<div class="flex justify-end gap-2">
				<Button
					type="button"
					label="Let's go"
					:disabled="!valid"
					@click="createUser"
				/>
			</div>
		</Dialog>
		<Toast />
		<ConfirmDialog>
			<template #icon>
				<Icon
					name="solar:danger-circle-linear"
					size="30"
				/>
			</template>
		</ConfirmDialog>
		<NuxtPage />
	</div>
</template>

<script setup lang="ts">
import type {IUser} from '~/interfaces'
import {z} from 'zod'

const {$toast} = useNuxtApp()

const modalVisible = ref<boolean>(true)
const user = useUser()

const newUser = reactive<Pick<IUser, 'fullName' | 'email'>>({
	fullName: '',
	email: '',
})

const schema = z.object({
	fullName: z
		.string()
		.nonempty({
			message: 'Fullname is required',
		})
		.refine((val) => val.trim() !== '', {
			message: 'Fullname cannot be empty',
		}),
	email: z.string().email(),
})

const {valid, validate, getError} = useFormValidation(schema, newUser, {
	mode: 'eager',
})

const createUser = async () => {
	await validate()

	if (!valid.value) return

	const req = await $fetch.raw<IUser>(`/api/user`, {
		method: 'POST',
		body: newUser,
		ignoreResponseError: true,
	})

	if (req.status === 200) {
		$toast.success('Your user has been created successfully')
		modalVisible.value = false
		user.value = req._data!
		return
	}

	$toast.error('An error occurred while creating your user')
}

provideHeadlessUseId(() => useId())
</script>
