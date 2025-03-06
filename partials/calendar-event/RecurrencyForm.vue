<template>
	<div class="h-full w-full">
		<div class="mb-8">
			<FloatLabel>
				<Select
					id="priority"
					v-model="recurrencyForm.recurrency"
					:options="recurrencyOptions"
					option-label="label"
					option-value="value"
					fluid
					:invalid="!!getError('recurrency')"
				/>
				<label for="priority">Recurrency</label>
			</FloatLabel>
			<span
				v-if="!!getError('priority')"
				class="text-sm text-red-600"
				>{{ getError('priority') }}</span
			>
		</div>

		<div class="mb-8">
			<FloatLabel>
				<InputNumber
					v-model="recurrencyForm.repeatForEach"
					input-id="repeatForEach"
					fluid
					show-buttons
					mode="decimal"
					:min="1"
					:suffix="suffix"
					:invalid="!!getError('repeatForEach')"
				/>
				<label for="repeatForEach">Repeat for</label>
			</FloatLabel>
			<span
				v-if="!!getError('priority')"
				class="text-sm text-red-600"
				>{{ getError('priority') }}</span
			>
		</div>

		<template v-if="recurrencyForm.recurrency === 'WEEKLY'">
			<div class="mb-8">
				<div class="mb-1">
					<label class="text-slate-600">Repeat on</label>
				</div>
				<SelectButton
					v-model="recurrencyForm.repeatDay"
					:options="weekDayOptions"
					option-label="name"
					multiple
					aria-labelledby="multiple"
					class="text-sm text-slate-600"
					:invalid="!!getError('repeatDay')"
				/>
				<span class="text-sm text-red-600">{{ getError('repeatDay') }}</span>
			</div>
		</template>

		<template v-if="recurrencyForm.recurrency === 'MONTHLY'">
			<div class="mb-8">
				<FloatLabel>
					<InputNumber
						v-model="recurrencyForm.mounthDay"
						input-id="mounthDay"
						fluid
						show-buttons
						mode="decimal"
						:min="1"
						:max="31"
						prefix="Every day "
						suffix=" of every month"
						:invalid="!!getError('mounthDay')"
					/>
					<label for="mounthDay')">Mounth day</label>
				</FloatLabel>
				<span
					v-if="!!getError('priority')"
					class="text-sm text-red-600"
					>{{ getError('priority') }}</span
				>
			</div>
		</template>

		<template v-if="recurrencyForm.recurrency === 'YEARLY'">
			<div class="mb-4">
				<div class="flex gap-8 xl:flex-col 2xl:flex-row">
					<div>
						<FloatLabel>
							<Select
								id="priority"
								v-model="recurrencyForm.mounth"
								:options="mounthOptions"
								option-label="label"
								option-value="value"
								fluid
								:invalid="!!getError('mounth')"
							/>
							<label for="priority">Repaeat</label>
						</FloatLabel>
						<span
							v-if="!!getError('mounth')"
							class="text-sm text-red-600"
							>{{ getError('mounth') }}</span
						>
					</div>
					<div>
						<FloatLabel>
							<InputNumber
								v-model="recurrencyForm.mounthDay"
								input-id="mounthDay"
								fluid
								show-buttons
								mode="decimal"
								:min="1"
								:max="31"
								prefix="Every day "
								:suffix="` of ${
									recurrencyForm.mounth
										? mounthOptions[recurrencyForm.mounth - 1].label
										: ''
								}`"
								:invalid="!!getError('mounthDay')"
							/>
							<label for="mounthDay')">Mounth day</label>
						</FloatLabel>
						<span
							v-if="!!getError('priority')"
							class="text-sm text-red-600"
							>{{ getError('priority') }}</span
						>
					</div>
				</div>
			</div>
		</template>

		<div class="mb-4">
			<span class="text-slate-600">End of repeat:</span>

			<div class="align-items-center my-2 flex">
				<RadioButton
					v-model="recurrencyForm.endType"
					input-id="never"
					name="endType"
					:value="'never'"
					variant="filled"
				/>
				<label
					for="never"
					class="ml-2 cursor-pointer text-sm text-slate-600"
				>
					Never
				</label>
			</div>

			<div class="flex items-center gap-2">
				<div class="align-items-center mt-2 flex">
					<RadioButton
						v-model="recurrencyForm.endType"
						input-id="endDate"
						name="endType"
						:value="'date'"
						variant="filled"
					/>
					<label
						for="endDate"
						class="ml-2 cursor-pointer text-sm text-slate-600"
					>
						In
					</label>
				</div>
				<div class="max-w-40">
					<AppInputDate
						id="ecorrenciaDataTermino"
						v-model="recurrencyForm.endDate"
						:disabled="recurrencyForm.endType !== 'date'"
						:min-date="new Date()"
						required
					/>
				</div>
			</div>

			<div class="mt-4 flex items-center gap-2">
				<div class="align-items-center flex">
					<RadioButton
						v-model="recurrencyForm.endType"
						input-id="endOccurrences"
						name="endType"
						:value="'occurrences'"
						variant="filled"
					/>
					<label
						for="endOccurrences"
						class="ml-2 cursor-pointer text-sm text-slate-600"
					>
						After of
					</label>
				</div>
				<div class="max-w-42">
					<InputNumber
						v-model="recurrencyForm.occurrenceNumber"
						input-id="occurrenceNumber"
						fluid
						show-buttons
						mode="decimal"
						suffix=" occurrences"
						:disabled="recurrencyForm.endType !== 'occurrences'"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import {Frequency, RRule, rrulestr, type Options, type ByWeekday} from 'rrule'
import * as zod from 'zod'
import type {FrequencyString, IRecurrencyForm, WeekDayOp} from '~/interfaces'

const props = defineProps<{
	isEditing?: boolean
}>()

const {isEditing} = toRefs(props)

const model = defineModel<string>('recurrencyRule')

const recurrencyForm = reactive<IRecurrencyForm>({
	recurrency: 'HOURLY',
	repeatForEach: 1,
	repeatDay: [],
	endType: undefined,
	endDate: undefined,
	occurrenceNumber: undefined,
	mounthDay: undefined,
	mounth: undefined,
})

const repeatDaySchema = zod.object({
	name: zod.string(),
	value: zod.any(),
})

const zodSchema = zod.object({
	recurrency: zod
		.string({
			required_error: 'Selecione a recorrência',
		})
		.min(1, {
			message: 'Selecione a recorrência',
		}),
	repeatForEach: zod
		.number({
			required_error: 'Informe a repetição',
		})
		.min(1, {
			message: 'Repetição não pode ser menor do que 1',
		}),
	repeatDay: zod
		.array(repeatDaySchema)
		.optional()
		.refine(
			(value) => {
				if (recurrencyForm.recurrency === 'WEEKLY')
					return value && value.length > 0
				else return true
			},
			{message: 'Selecione o dia da semana'}
		),
	mounthDay: zod
		.number({
			invalid_type_error: 'Informe o dia do mês',
		})
		.optional()
		.refine(
			(value) => {
				if (
					recurrencyForm.recurrency === 'MONTHLY' ||
					recurrencyForm.recurrency === 'YEARLY'
				) {
					return value !== undefined
				}

				return true
			},
			{
				message: 'Informe o dia do mês',
			}
		),
	mounth: zod
		.number()
		.optional()
		.refine(
			(value) => {
				if (recurrencyForm.recurrency === 'YEARLY') return value !== undefined
				else return true
			},
			{
				message: 'Informe o mês',
			}
		),
})

const {validate, getError, valid} = useFormValidation(zodSchema, recurrencyForm)

const weekDayOptions: WeekDayOp[] = [
	{name: 'Mon', value: RRule.MO},
	{name: 'Tu', value: RRule.TU},
	{name: 'We', value: RRule.WE},
	{name: 'Th', value: RRule.TH},
	{name: 'Fr', value: RRule.FR},
	{name: 'Sa', value: RRule.SA},
	{name: 'Su', value: RRule.SU},
]

const recurrencyOptions = [
	{label: 'Hour by hour', value: 'HOURLY'},
	{label: 'Daily', value: 'DAILY'},
	{label: 'Weekly', value: 'WEEKLY'},
	{label: 'Monthly', value: 'MONTHLY'},
	{label: 'Annually', value: 'YEARLY'},
]

const mounthOptions = [
	{label: 'January', value: 1},
	{label: 'February', value: 2},
	{label: 'March', value: 3},
	{label: 'April', value: 4},
	{label: 'May', value: 5},
	{label: 'June', value: 6},
	{label: 'July', value: 7},
	{label: 'August', value: 8},
	{label: 'September', value: 9},
	{label: 'October', value: 10},
	{label: 'November', value: 11},
	{label: 'December', value: 12},
]

const suffix = computed(() => {
	const suffixos = {
		HOURLY: 'hour(s)',
		DAILY: 'day(s)',
		WEEKLY: 'week(s)',
		MONTHLY: 'mounth(s)',
		YEARLY: 'year(s)',
	}

	if (!recurrencyForm.recurrency) return ''

	return ` ${suffixos[recurrencyForm.recurrency]}`
})

const gerarRRule = (): string => {
	const options: Partial<Options> = {
		freq: Frequency[recurrencyForm.recurrency as FrequencyString],
		interval: recurrencyForm.repeatForEach,
	}

	if (
		recurrencyForm.recurrency === 'WEEKLY' &&
		recurrencyForm.repeatDay?.length
	) {
		options.byweekday = recurrencyForm.repeatDay.map(
			(i) => i.value as ByWeekday
		)
	}

	if (recurrencyForm.recurrency === 'MONTHLY' && recurrencyForm.mounthDay) {
		options.bymonthday = recurrencyForm.mounthDay
	}

	if (
		recurrencyForm.recurrency === 'YEARLY' &&
		recurrencyForm.mounth &&
		recurrencyForm.mounthDay
	) {
		options.bymonth = recurrencyForm.mounth
		options.bymonthday = recurrencyForm.mounthDay
	}

	if (recurrencyForm.endType === 'date' && recurrencyForm.endDate) {
		options.until = new Date(recurrencyForm.endDate)
	} else if (
		recurrencyForm.endType === 'occurrences' &&
		recurrencyForm.occurrenceNumber
	) {
		options.count = recurrencyForm.occurrenceNumber
	}

	return new RRule(options).toString().replace('RRULE:', '')
}

watch(
	recurrencyForm,
	async () => {
		await validate()

		if (valid.value) model.value = gerarRRule()
		else model.value = undefined
	},
	{
		immediate: !isEditing.value,
	}
)

watch(
	isEditing,
	(nv) => {
		if (nv && model.value) {
			const {options} = rrulestr(model.value)

			recurrencyForm.recurrency = Frequency[options.freq] as FrequencyString
			recurrencyForm.repeatForEach = options.interval
			recurrencyForm.repeatDay = options.byweekday
				? weekDayOptions.filter((i) =>
						options.byweekday?.includes(i.value.weekday!)
				  )
				: undefined

			recurrencyForm.mounth = options.bymonth ? options.bymonth[0] : undefined
			recurrencyForm.mounthDay = options.bymonthday
				? options.bymonthday[0]
				: undefined

			if (options.until) {
				recurrencyForm.endType = 'date'
				recurrencyForm.endDate = options.until
			} else if (options.count) {
				recurrencyForm.endType = 'occurrences'
				recurrencyForm.occurrenceNumber = options.count
			} else {
				recurrencyForm.endType = 'never'
			}
		}
	},
	{
		immediate: true,
	}
)

watch(
	() => recurrencyForm.endType,
	() => {
		recurrencyForm.occurrenceNumber = undefined
		recurrencyForm.endDate = undefined
	}
)
</script>
