import {useConfirm} from 'primevue/useconfirm'

export default defineNuxtPlugin({
	name: `confirm-dialog-plugin`,
	setup(nuxtApp) {
		const useUseConfirm = useConfirm()

		const useConfirmFn = () => {
			type Params = {
				message: string
				header?: string
				accept: () => void
				reject?: () => void
			}

			const openDeleteModal = ({message, accept, reject, header}: Params) =>
				useUseConfirm.require({
					message,
					header: header ?? 'Danger Zone',
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
						if (reject) reject()
						useUseConfirm.close()
					},
				})

			const openConfirmModal = ({message, accept, reject, header}: Params) =>
				useUseConfirm.require({
					message,
					header: header ?? 'Warning',
					icon: 'pi pi-info-circle',
					rejectLabel: 'Cancel',
					rejectProps: {
						label: 'Cancel',
						severity: 'secondary',
						outlined: true,
					},
					acceptProps: {
						label: 'Confirm',
						severity: 'success',
					},
					accept: () => {
						accept()
						useUseConfirm.close()
					},
					reject: () => {
						if (reject) reject()
						useUseConfirm.close()
					},
				})

			return {openDeleteModal, openConfirmModal}
		}

		return {
			provide: {
				useConfirm: useConfirmFn(),
			},
		}
	},
})
