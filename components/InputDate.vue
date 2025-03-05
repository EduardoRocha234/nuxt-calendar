<template>
	<div class="relative w-full">
		<div class="flex flex-col gap-2">
			<Skeleton
				v-if="loading"
				height="1.5rem"
				width="5.6rem"
			></Skeleton>
			<template v-if="!loading">
				<!-- <DatePicker
					v-model="model"
					v-bind="props"
					class="w-full"
					:invalid="!!error"
					panel-class="z-[9999]"
					:auto-z-index="false"
				/> -->
				<FloatLabel>
					<DatePicker
						v-model="model"
						v-bind="props"
						class="w-full"
						:invalid="!!error"
						panel-class="z-[9999]"
						:auto-z-index="false"
					/>
					<label :for="id">{{ label }}</label>
				</FloatLabel>
			</template>
			<Skeleton
				v-else
				height="2.5rem"
			></Skeleton>
		</div>
		<span
			v-if="!!error"
			class="md:text-md text-sm text-red-500"
		>
			{{ error }}
		</span>
	</div>
</template>

<script setup lang="ts">
import type {DatePickerProps} from 'primevue/datepicker'

const props = withDefaults(
	defineProps<
		{
			id: string
			showIcon?: boolean
			iconDisplay?: 'input' | 'button'
			dateFormat?: string
			error?: string
			loading?: boolean
			label?: string
			required?: boolean
			disabled?: boolean
			readOnly?: boolean
		} & Omit<DatePickerProps, 'modelValue'>
	>(),
	{
		showIcon: true,
		iconDisplay: 'input',
		dateFormat: 'dd/mm/yy',
		error: undefined,
		label: undefined,
		loading: false,
		required: false,
		disabled: false,
		readOnly: false,
		manualInput: true,
	}
)

const model = defineModel<any>()
</script>

<style scoped></style>
