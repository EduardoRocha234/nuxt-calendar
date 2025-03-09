import ConfirmationService from 'primevue/confirmationservice'
import {useConfirm} from 'primevue/useconfirm'

export default defineNuxtPlugin({
	name: `confirm-dialog-plugin`,
	setup(nuxtApp) {
		nuxtApp.vueApp.use(ConfirmationService)

		const useUseConfirm = useConfirm()

		const useConfirmFn = () => {
			type Params = {
				message: string
				accept: () => void
				reject: () => void
			}

			const openDeleteModal = ({message, accept, reject}: Params) =>
				useUseConfirm.require({
					message,
					header: 'Danger Zone',
					icon: 'pi pi-info-circle',
					rejectLabel: 'Cancel',
					rejectProps: {
						label: 'Cancel',
						severity: 'secondary',
						outlined: true,
					},
					acceptProps: {
						label: 'Delete',
						severity: 'danger',
					},
					accept: () => {
						accept()
						useUseConfirm.close()
					},
					reject: () => {
						reject()
						useUseConfirm.close()
					},
				})

			return {openDeleteModal}
		}

		return {
			provide: {
				useConfirm: useConfirmFn(),
			},
		}
	},
})
