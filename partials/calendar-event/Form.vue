<template>
	<Dialog
		v-model:visible="visible"
		:header="isEditing ? 'Update event' : 'Add event'"
		modal
		maximizable
		:style="{width: '80vw'}"
	>
		<div
			class="flex h-full w-full gap-4 overflow-y-auto px-2 py-6 scrollbar-thin xl:h-[22rem] 2xl:h-[40rem]"
		>
			<div
				class="h-full w-full flex-1"
				:class="{
					'border-r-2 border-slate-200 pr-4': recurrencyEvent,
				}"
			>
				<div class="mb-8 w-full">
					<AppInputText
						id="titile"
						v-model="formEvent.name"
						label="Title"
						:error="getError('name')"
						:loading="showLoading"
						required
					/>
				</div>
				<div class="mb-8 flex gap-2">
					<div class="w-6/12">
						<AppInputDate
							id="startDate"
							v-model="formEvent.startDate"
							label="Start date"
							show-time
							hour-format="24"
							:error="getError('startDate')"
							:loading="showLoading"
							required
						/>
					</div>
					<div class="w-6/12">
						<AppInputDate
							id="endDate"
							v-model="formEvent.endDate"
							label="End date"
							show-time
							hour-format="24"
							:error="getError('endDate')"
							:loading="showLoading"
							required
						/>
					</div>
				</div>
				<div class="mb-8 w-full">
					<FloatLabel>
						<Select
							id="calendarId"
							v-model="formEvent.calendarId"
							:options="calendars"
							option-label="name"
							option-value="id"
							fluid
							:loading="showLoading"
							:invalid="!!getError('calendarId')"
						/>
						<label for="calendarId">Select a calendar</label>
					</FloatLabel>
					<span
						v-if="!!getError('calendarId')"
						class="text-sm text-red-600"
						>{{ getError('calendarId') }}</span
					>
				</div>
				<div class="mb-8 w-full">
					<FloatLabel>
						<Textarea
							v-model="formEvent.description"
							:loading="showLoading"
							fluid
						/>
						<label for="calendarId">Description</label>
					</FloatLabel>
				</div>
				<div class="mb-8 w-full">
					<FloatLabel>
						<Select
							id="priority"
							v-model="formEvent.priority"
							:options="priorityOptions"
							option-label="name"
							option-value="id"
							fluid
							:invalid="!!getError('priority')"
							:loading="showLoading"
						/>
						<label for="priority">Priority mode</label>
					</FloatLabel>
					<span
						v-if="!!getError('priority')"
						class="text-sm text-red-600"
						>{{ getError('priority') }}</span
					>
				</div>
				<div class="mb-8 flex gap-2">
					<div class="flex w-full flex-col">
						<FloatLabel>
							<MultiSelect
								id="guests"
								v-model="selectedGuests"
								display="chip"
								:options="users"
								option-label="userName"
								option-value="id"
								filter
								fluid
								:max-selected-labels="3"
								:invalid="!!getError('guestsIds')"
								:loading="loadingUsers || showLoading"
								:show-toggle-all="false"
								:virtual-scroller-options="{itemSize: 44}"
							>
								<template #loadingicon
									><Icon
										name="mingcute:loading-3-fill"
										class="animate-spin text-slate-500"
										size="25"
								/></template>
							</MultiSelect>
							<label for="guests">Guests</label>
						</FloatLabel>
						<span
							v-if="!!getError('guestsIds')"
							class="text-sm text-red-600"
							>{{ getError('guestsIds') }}</span
						>
					</div>
				</div>
				<div class="mb-4 flex gap-6">
					<div class="flex items-center gap-2">
						<ToggleSwitch
							v-model="formEvent.allDay"
							input-id="allDay"
						/>
						<label
							for="allDay"
							class="cursor-pointer text-slate-600"
							>All day</label
						>
					</div>
					<div class="flex items-center gap-2">
						<ToggleSwitch
							v-model="formEvent.notify"
							input-id="notify"
						/>
						<label
							for="notify"
							class="cursor-pointer text-slate-600"
							>Notify by email</label
						>
					</div>
					<div class="flex items-center gap-2">
						<ToggleSwitch
							v-model="recurrencyEvent"
							input-id="recurrencyEvent"
						/>
						<label
							for="recurrencyEvent"
							class="cursor-pointer text-slate-600"
							>Recurrency</label
						>
					</div>
				</div>
			</div>
			<div
				v-if="recurrencyEvent"
				class="h-full w-5/12"
			>
				<!-- <LazyUiPartialSistemaAreaTrabalhoFormEventoRecorrencia
					v-model:regra-recorrencia="formEvent.regraRecorrencia"
					:tela-editar="isEditing"
				/> -->
				<AppPartialCalendarEventRecurrencyForm
					v-model:recurrency-rule="formEvent.recurrencyRule"
					:is-editing="isEditing"
				/>
			</div>
		</div>
		<template #footer>
			<div class="w-full flex justify-end gap-4 mx-4">
				<Button
					text
					@click="closeModal"
				>
					Cancel
				</Button>
				<Button @click="sendForm">Save</Button>
			</div>
		</template>
	</Dialog>
</template>

<script setup lang="ts">
import {
	EventPriority,
	type ICalendar,
	type ICalendarEvent,
	type IUser,
} from '~/interfaces'
import * as zod from 'zod'

const props = defineProps<{
	id?: string | null
	calendars: ICalendar[]
	startDate?: Date
	endDate?: Date
}>()

const {calendars, startDate, endDate} = toRefs(props)

const user = useUser()

const emits = defineEmits<{
	(event: 'delete', id: string): void
	(event: 'refreshData'): () => void
}>()

const {$toast} = useNuxtApp()

const isEditing = computed(() => !!props.id)
const visible = defineModel<boolean>()
const loading = ref<boolean>(false)
const users = ref<IUser[]>([])
const loadingUsers = ref<boolean>(false)
const selectedGuests = ref<number[]>([])
const recurrencyEvent = ref<boolean>(false)

const showLoading = computed(
	() => isEditing.value && (loading.value || loadingUsers.value)
)

const priorityOptions = Object.values(EventPriority).map((value) => ({
	id: value,
	name: value,
}))

const initialValues: ICalendarEvent = {
	id: undefined,
	name: undefined,
	description: undefined,
	priority: undefined,
	startDate: undefined,
	endDate: undefined,
	recurrencyRule: undefined,
	calendarId: undefined,
	userId: user.value?.id,
	guestsIds: undefined,
	color: undefined,
	allDay: false,
	notify: false,
}

const formEvent = reactive<ICalendarEvent>({
	...initialValues,
})

const validation = zod.object({
	name: zod
		.string({
			required_error: 'Title is required',
		})
		.min(3, {
			message: 'Title must have at least 3 characters',
		})
		.max(100, {
			message: 'Title must have at most 100 characters',
		}),
	startDate: zod
		.date({
			message: 'Start date is required',
			invalid_type_error: 'Start date is required',
		})
		.refine((val) => validateDate(val, '<=', new Date(formEvent.endDate!)), {
			message: 'Start date cannot be later than End date',
		}),
	endDate: zod
		.date({
			message: 'End date is required',
			invalid_type_error: 'End date is required',
		})
		.refine((val) => validateDate(val, '>=', new Date(formEvent.startDate!)), {
			message: 'End date cannot be earlier than Start date',
		}),
	calendarId: zod.number({
		required_error: 'Calendar is required',
		invalid_type_error: 'Calendar is required',
	}),
	priority: zod
		.string({
			required_error: 'Priority is required',
		})
		.min(1, {
			message: 'Priority is required',
		}),
	description: zod.string().optional().nullable(),
	recurrencyRule: zod
		.string()
		.optional()
		.nullable()
		.refine((value) => {
			if (recurrencyEvent.value) return value !== undefined
			else return true
		}),
})

const {valid, getError, validate, clearErrors, errors} = useFormValidation(
	validation,
	formEvent
)

const sendForm = async () => {
	try {
		formEvent.guestsIds =
			selectedGuests.value.length > 0
				? selectedGuests.value.join(',')
				: undefined

		await validate()

		if (!valid.value) return

		if (props.id) await updateEvent()
		else await addNewEvent()

		closeModal()
	} catch (err) {
		$toast.error((err as Error).message)
	}
}

const closeModal = () => {
	visible.value = false
	Object.assign(formEvent, initialValues)
}

const fetchUsers = async () => {
	loadingUsers.value = true
	const res = await $fetch.raw<IUser[]>('api/user', {
		ignoreResponseError: true,
	})
	loadingUsers.value = false

	if (res.ok) {
		users.value = res._data as IUser[]
	} else {
		$toast.error('An error occurred while fetching guests')
	}
}

const getEventById = async () => {
	try {
		loading.value = true
		const response = await $fetch.raw<ICalendarEvent>(
			`api/calendar-event/${props.id}`,
			{
				ignoreResponseError: true,
			}
		)

		if (response.ok) {
			const data = response._data as ICalendarEvent
			Object.assign(formEvent, {
				...data,
				startDate: data.startDate ? new Date(data.startDate) : undefined,
				endDate: data.endDate ? new Date(data.endDate) : undefined,
			})

			if (data.recurrencyRule?.length) recurrencyEvent.value = true

			if (data.guestsIds) {
				const splitParticipantes = data.guestsIds?.split(',').map(Number)

				if (splitParticipantes.length > 0) {
					selectedGuests.value = splitParticipantes
				} else {
					selectedGuests.value.push(Number(data.guestsIds))
				}
			}
			return
		}

		$toast.error('An error ocurrend while fetching the event')
	} catch (error) {
		$toast.error('An error ocurrend while fetching the event')
	} finally {
		loading.value = false
	}
}

const updateEvent = async () => {
	const req = await $fetch.raw(`/api/calendar-event/${props.id}`, {
		method: 'PUT',
		body: formEvent,
		ignoreResponseError: true,
	})

	if (req.status === 200) {
		$toast.success('Event updated successfully')
		emits('refreshData')
		return
	}

	throw new Error((req._data as any).message)
}

const addNewEvent = async () => {
	const req = await $fetch.raw(`/api/calendar-event`, {
		method: 'POST',
		body: formEvent,
		ignoreResponseError: true,
	})

	if (req.status === 201) {
		$toast.success('Event created successfully')
		emits('refreshData')
		return
	}

	throw new Error((req._data as any).message)
}

watch(recurrencyEvent, (nv) => {
	if (!nv) formEvent.recurrencyRule = undefined
})

watch(visible, async (visivel) => {
	clearErrors()

	if (visivel && users.value.length === 0) {
		await fetchUsers()
	}

	if (visivel && props.id) {
		await getEventById()
		return
	}

	if (visivel && !props.id) {
		Object.assign(formEvent, initialValues)
		recurrencyEvent.value = false
		selectedGuests.value = []
		formEvent.userId = user.value?.id
		formEvent.startDate = startDate.value
		formEvent.endDate = endDate.value
	}
})
</script>

<style scoped></style>
