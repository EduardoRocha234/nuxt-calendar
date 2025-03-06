<template>
	<div>
		<Dialog
			v-model:visible="visible"
			header="Hello! Good to see you here"
			:style="{width: '25rem'}"
			position="top"
			:modal="true"
			:draggable="false"
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
					required
				/>
			</div>
			<div class="w-full mb-8">
				<AppInputText
					id="email"
					v-model="newUser.email"
					label="email"
					required
				/>
			</div>
			<div class="flex justify-end gap-2">
				<Button
					type="button"
					label="Let's go"
					@click="test"
				/>
			</div>
		</Dialog>
		<Toast />
		<NuxtPage />
	</div>
</template>

<script setup lang="ts">
import type {IUser} from '~/interfaces'

const {$toast} = useNuxtApp()

const visible = ref(true)
const user = useUser()

const newUser = reactive<Pick<IUser, 'fullName' | 'email'>>({
	fullName: '',
	email: '',
})

const test = async () => {
	const req = await $fetch.raw<IUser>(`/api/user`, {
		method: 'POST',
		body: newUser,
		ignoreResponseError: true,
	})

	if (req.status === 200) {
		$toast.success('Event created successfully')
		visible.value = false
		user.value = req._data!
		return
	}

	$toast.error('An error occurred while creating your user')
}

provideHeadlessUseId(() => useId())
</script>
