import {useConfirm} from 'primevue/useconfirm'

export default defineNuxtPlugin({
	name: `confirm-dialog-plugin`,
	setup(nuxtApp) {
		const useUseConfirm = useConfirm()

		const useConfirmFn = () => {
			type Params = {
				message: string
				accept: () => void
				reject?: () => void
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
						if(reject) reject()
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
