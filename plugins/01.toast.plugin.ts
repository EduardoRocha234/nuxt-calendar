import {useToast} from 'primevue/usetoast'

export default defineNuxtPlugin((nuxtApp) => {
	const toast = useToast()

	const toastFn = () => {
		const success = (message: string) =>
			toast.add({
				severity: 'success',
				summary: 'Success',
				detail: message,
				life: 3000,
			})

		const error = (message: string) =>
			toast.add({
				severity: 'error',
				summary: 'Error',
				detail: message,
				life: 3000,
			})

		const warning = (message: string) =>
			toast.add({
				severity: 'warn',
				summary: 'Warning',
				detail: message,
				life: 3000,
			})

		return {success, error, warning}
	}

	return {
		provide: {
			toast: toastFn(),
		},
	}
})
