import { type ZodTypeAny, z } from 'zod'
import { get, groupBy } from 'lodash-es'

export function useFormValidation<T extends ZodTypeAny>(
	schema: T,
	form: MaybeRefOrGetter<Record<string, unknown>>,
	option?: { modo: 'eager' | 'lazy' },
) {
	const optionParam = Object.assign({}, { modo: 'lazy' }, option)

	const valid = ref<boolean>(true)
	const errors = ref<Record<string, z.ZodIssue[]> | null>(null)
	const { pause, resume } = watch(
		() => toValue(form),
		async () => {
			await validate()
		},
		{ deep: true },
	)

	pause()

	const clearErrors = () => {
		errors.value = null
		pause()
	}

	const validate = async () => {
		clearErrors()

		const validationResult = await schema.safeParseAsync(
			toValue(form),
		)

		valid.value = validationResult.success

		if (!validationResult.success) {
			errors.value = groupBy(validationResult.error.issues, 'path')
			resume()
		}

		return errors
	}

	const getError = (path: string) =>
		get(errors.value, `${path.replaceAll('.', ',')}.0.message`) as
			| string
			| undefined

	if (optionParam.modo === 'eager') {
		resume()
	}

	return { validate, errors, valid, clearErrors, getError }
}
