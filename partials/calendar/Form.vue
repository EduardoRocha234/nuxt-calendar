<template>
	<Dialog
		v-model:visible="visible"
		:header="isEditing ? 'Update calendar' : 'Add calendar'"
		modal
		maximizable
		:style="{width: '80vw'}"
	>
		<div class="w-full py-6 px-2">
			<div class="mb-8 w-full">
				<AppInputText
					id="name"
					v-model="calendarForm.name"
					label="Name"
					:loading="loading"
					:error="getError('name')"
					:read-only="readOnly"
					required
				/>
			</div>
			<div class="mb-4 w-full">
				<FloatLabel>
					<Textarea
						v-model="calendarForm.description"
						:loading="loading"
						:invalid="!!getError('description')"
						fluid
						rows="4"
					/>
					<label for="calendarId">Description</label>
					<span
						v-if="!!getError('description')"
						class="text-sm text-red-600"
						>{{ getError('description') }}</span
					>
				</FloatLabel>
			</div>
			<div class="mb-4 w-full flex items-center gap-2">
				<label for="calendarId">Define a color: </label>
				<ColorPicker
					name="color"
					v-model="calendarForm.color"
				/>
			</div>
		</div>
		<template
			v-if="!readOnly"
			#footer
		>
			<div class="w-full flex justify-end gap-4 mx-4">
				<Button
					text
					@click="closeModalForm"
				>
					Cancel
				</Button>
				<Button @click="sendForm">Save</Button>
			</div>
		</template>
	</Dialog>
</template>

<script setup lang="ts">
import type {ICalendar} from '~/interfaces'
import * as zod from 'zod'

const props = defineProps<{
	calendarId?: number
}>()

const {calendarId} = toRefs(props)

const {$toast} = useNuxtApp()
const user = useUser()

const emits = defineEmits<{
	(event: 'delete', id: number): void
	(event: 'refreshData'): () => void
}>()

const isEditing = computed(() => !!calendarId.value)
const visible = defineModel<boolean>()
const loading = ref<boolean>(false)

const readOnly = computed(() => calendarForm.userId !== user?.value?.id)

const initValues: ICalendar = {
	id: undefined,
	name: undefined,
	description: undefined,
	userId: user.value?.id,
	color: getRandomHexColor(),
}

const calendarForm = reactive<ICalendar>({
	...initValues,
})

const validationSchema = zod.object({
	name: zod
		.string({
			required_error: 'Name is required',
		})
		.min(3, {
			message: 'Name is required',
		})
		.max(100, {
			message: 'Name should have at most 100 characters',
		}),
	description: zod
		.string()
		.max(1000, {
			message: 'Description should have at most 1000 characters',
		})
		.nullable()
		.optional(),
})

const {validate, getError, valid, clearErrors} = useFormValidation(
	validationSchema,
	calendarForm
)

const sendForm = async () => {
	try {
		await validate()

		if (!valid.value) return

		if (calendarId.value) await updateCalendar()
		else await createCalendar()

		closeModalForm()
	} catch (err) {
		$toast.error((err as Error).message)
	}
}

const closeModalForm = () => {
	visible.value = false
	Object.assign(calendarForm, initValues)
	clearErrors()
}

const deleteCalendar = () => {
	if (calendarId.value) {
		closeModalForm()
		emits('delete', calendarId.value)
	}
}

const fetchCalendarById = async () => {
	try {
		loading.value = true
		const response = await $fetch.raw<ICalendar>(
			`api/v1/agendas/agenda/${calendarId.value}`,
			{
				ignoreResponseError: true,
			}
		)

		if (response.ok) {
			Object.assign(calendarForm, response._data as ICalendar)
			return
		}

		$toast.error('An error ocurrend while fetching calendar')
	} catch (error) {
		$toast.error('An error ocurrend while fetching calendar')
	} finally {
		loading.value = false
	}
}

const updateCalendar = async () => {
	const req = await $fetch.raw(
		`api/v1/agendas/agenda-evento/${calendarId.value}/atualizar`,
		{
			method: 'PUT',
			body: calendarForm,
			ignoreResponseError: true,
		}
	)

	if (req.status === 200) {
		$toast.success('Calendar updated successfully')
		emits('refreshData')
		return
	}

	throw new Error((req._data as any).message)
}

const createCalendar = async () => {
	const req = await $fetch.raw(`/api/calendar`, {
		method: 'POST',
		body: calendarForm,
		ignoreResponseError: true,
	})

	if (req.status === 201) {
		$toast.success('Calendar created successfully')
		emits('refreshData')
		return
	}

	throw new Error((req._data as any).message)
}

watch(visible, async (visivel) => {
	clearErrors()
	if (visivel && calendarId.value) {
		await fetchCalendarById()
	} else {
		Object.assign(calendarForm, {
			...initValues,
			userId: user.value?.id,
			color: getRandomHexColor(),
		})
	}
})
</script>

<style scoped></style>
