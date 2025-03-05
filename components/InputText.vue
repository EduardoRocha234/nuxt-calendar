<template>
	<div class="w-full h-full">
		<div class="flex flex-col gap-2">
			<Skeleton
				v-if="loading"
				height="1.5rem"
				width="5.6rem"
			></Skeleton>
			<template v-if="!loading">
				<FloatLabel>
					<InputText
						v-model="model"
						v-bind="props"
						fluid
						:invalid="invalid || !!error"
						size="small"
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
			class="md:text-md text-sm text-red-500 transition-all duration-200"
		>
			{{ error }}
		</span>
	</div>
</template>

<script setup lang="ts">
import InputText from 'primevue/inputtext'

const props = withDefaults(
	defineProps<{
		id: string
		placeholder?: string
		label?: string
		error?: string
		loading?: boolean
		invalid?: boolean
		disabled?: boolean
		required?: boolean
		readOnly?: boolean
	}>(),
	{
		placeholder: undefined,
		label: undefined,
		error: undefined,
		loading: false,
		disabled: false,
		invalid: false,
		required: false,
		readOnly: false,
	}
)

const model = defineModel<string | undefined>()
</script>

<style scoped></style>
