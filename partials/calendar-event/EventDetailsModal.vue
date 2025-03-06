<template>
	<Dialog
		ref="modalRef"
		v-model:visible="visible"
		:style="{
			width: '26rem',
			position: 'absolute',
			left: modalPosition.x + 'px',
			top: modalPosition.y + 'px',
		}"
		dismissable-mask
	>
		<template #header>
			<div class="flex w-full items-center justify-between">
				<div class="flex items-center gap-2">
					<span
						class="h-5 w-5 rounded-md"
						:style="{
							backgroundColor: clickedEvent?.backgroundColor,
						}"
					></span>
					<span class="text-lg font-bold">{{ clickedEvent?.title }}</span>
				</div>
				<div class="mr-5 flex items-center gap-2">
					<button
						title="Update event"
						class="flex items-center justify-center rounded-full p-2 transition-colors hover:bg-slate-100"
						@click="onUpdateEvent"
					>
						<Icon
							name="mdi:pencil"
							class="text-slate-600"
							size="18"
						/>
					</button>
					<button
						title="Delete event"
						class="flex items-center justify-center rounded-full p-2 transition-colors hover:bg-slate-100"
						@click="openConfirmDeleteModal"
					>
						<Icon
							name="mdi:trash"
							class="text-slate-600"
							size="18"
						/>
					</button>
				</div>
			</div>
		</template>

		<div class="h-full w-full">
			<div class="mb-4 w-full text-sm">
				{{
					dayjs(clickedEvent?.start).format(
						'dddd, D [de] MMMM [de] YYYY, h:mmA'
					)
				}}
				<template v-if="clickedEvent?.end">
					-
					{{
						adjustDateForShow(
							clickedEvent.allDay,
							clickedEvent.start,
							clickedEvent.end
						)
					}}</template
				>
			</div>

			<!-- <div
				v-if="dadosResponsavel"
				class="group mb-2 max-h-32 w-full overflow-auto rounded-md bg-slate-100 p-2 text-sm"
			>
				<div class="flex items-center justify-between pr-2">
					<div class="flex items-center gap-2">
						<Avatar
							:label="
								!dadosResponsavel?.avatar
									? dadosResponsavel.nomeCompleto[0].toUpperCase()
									: undefined
							"
							:image="dadosResponsavel.avatar || undefined"
							shape="circle"
							:pt="{
								image: {
									class: '!rounded-full',
								},
							}"
						/>
						<div class="flex flex-col">
							<span class="font-semibold">
								{{ dadosResponsavel.nomeCompleto }}
							</span>
							<span class="text-xs">Responsável</span>
						</div>
					</div>
					<Icon
						v-if="isSupported"
						name="mdi:content-copy"
						class="hidden cursor-pointer group-hover:block"
						title="Copiar e-mail do responsável"
						@click(dadosResponsavel.email)"
					/>
				</div>
			</div> -->
			<div
				v-if="clickedEvent?.extendedProps.description"
				class="mb-2 max-h-32 w-full overflow-auto rounded-md bg-slate-100 p-2 text-sm"
			>
				{{ clickedEvent?.extendedProps.description }}
			</div>
			<div
				v-if="
					clickedEvent?.extendedProps.priority
				"
				class="mb-2 flex max-h-20 w-full flex-col gap-1 overflow-auto rounded-md bg-slate-100 p-2 text-sm"
			>
				<span class="flex items-center gap-2">
					<Icon
						name="material-symbols:low-priority-rounded"
						size="25"
					/>
					Priority:
					<span class="font-semibold">{{
						clickedEvent?.extendedProps.priority
					}}</span>
				</span>
			</div>
			<div
				v-if="guestsEmails.length > 0"
				class="group mb-2 flex w-full flex-col gap-1 rounded-md bg-slate-100 p-2 text-sm"
			>
				<div class="mb-1 flex w-full items-center justify-between pr-2">
					<div class="flex items-center gap-2">
						<Icon
							name="mdi:account-group-outline"
							size="25"
						/>
						<span
							>{{ guestsEmails.length }}
							{{
								guestsEmails.length > 1 ? 'guests' : 'guest'
							}}</span
						>
					</div>
					<Icon
						v-if="isSupported"
						name="mdi:content-copy"
						class="hidden cursor-pointer group-hover:block"
						title="Cupy email address from guests"
						@click="copy(guestsEmails.join(', '))"
					/>
				</div>
				<ul class="max-h-40 overflow-auto scrollbar-thin">
					<li
						v-for="(participante, idx) in guestsData"
						:key="idx"
						class="my-1 flex cursor-pointer items-center gap-2 rounded-lg p-1 transition-colors hover:bg-slate-200"
					>
						<a
							:href="`mailto:${participante.email}`"
							class="flex items-center gap-2"
						>
							<Avatar
								:label="
									!participante?.avatar
										? participante.fullName[0].toUpperCase()
										: undefined
								"
								:image="participante.avatar || undefined"
								:style="{
									backgroundColor: generateRandomColor(),
									color: '#fff',
								}"
								shape="circle"
								:pt="{
									image: {
										class: '!rounded-full',
									},
								}"
								class="!size-6"
							/>
							<div class="flex flex-col">
								<span class="">
									{{ participante.fullName }}
								</span>
								<span class="text-xs">{{ participante.email }}</span>
							</div>
						</a>
					</li>
				</ul>
			</div>
		</div>
	</Dialog>
	<!-- <LazyUiModalConfirmarExclusaoV1
		v-model="deleteConfirmModal"
		header="Excluir evento"
		:on-close="() => closeConfirmDeleteModal()"
		:on-confirm="() => confirmDelete()"
	>
		<template #content>
			<div class="flex flex-col">
				<span>Deseja excluir este evento?</span>
				<span
					v-if="clickedEvent?.extendedProps.recorrencia"
					class="text-sm font-bold"
					>Ao excluir esta evento todas as recorrências deste evento serão
					deletados!</span
				>
			</div>
		</template>
	</LazyUiModalConfirmarExclusaoV1> -->
</template>

<script setup lang="ts">
import {EventImpl} from '@fullcalendar/core/internal'
import {useClipboard} from '@vueuse/core'
import type {IUser} from '~/interfaces'

const emits = defineEmits<{
	(event: 'refreshEvent', id: string): void
	(event: 'refreshData'): void
}>()

const {$toast} = useNuxtApp()
const dayjs = useDayjs()
const usuario = 1
const modalRef = ref<any>(null)

const {copy, isSupported} = useClipboard()

const visible = ref<boolean>(false)
const deleteConfirmModal = ref<boolean>(false)
const clickedEvent = ref<EventImpl | null>(null)
const modalPosition = reactive({x: 0, y: 0})
// const dadosResponsavel = ref<Usuario | null>(null)
const guestsData = ref<IUser[]>([])

const onUpdateEvent = () => {
	emits('refreshEvent', clickedEvent!.value!.id)
	visible.value = false
}

const generateRandomColor = () => {
	const r = Math.floor(Math.random() * 256)
	const g = Math.floor(Math.random() * 256)
	const b = Math.floor(Math.random() * 256)
	return `rgb(${r}, ${g}, ${b})`
}

const guestsEmails = computed(() => {
	if (!guestsData.value.length) return []

	return guestsData.value.map((g) => g.email)
})

const adjustDateForShow = (
	allDay: boolean,
	startDate: Date | null,
	endDate: Date | null
) => {
	if (allDay) {
		return dayjs(startDate).isSame(endDate, 'day')
			? dayjs(endDate).format('YYYY-MM-DD')
			: dayjs(endDate)
					.subtract(1, 'day')
					.format('dddd, D [de] MMMM [de] YYYY, h:mmA')
	}

	return dayjs(endDate).format('dddd, D [de] MMMM [de] YYYY, h:mmA')
}

const fetchResponsibleData = async (id: string) => {
	const res = await $fetch.raw<IUser>(`/api/v1/sistema/usuario/${id}`, {
		ignoreResponseError: false,
	})

	if (res.ok && res._data) {
		// dadosResponsavel.value = res._data
	}
}

const getGuestsData = async (participantesIds: string[]) => {
	try {
		const res = await Promise.all(
			participantesIds.map((id) => $fetch.raw<IUser>(`/api/user/${id}`))
		)

		guestsData.value = res.map((res) => res._data!)
	} catch (error) {
		guestsData.value = []
	}
}

const openDetailsModal = async ({
	event,
	positionX,
	positionY,
}: {
	positionX: number
	positionY: number
	event: EventImpl
}) => {
	let x = positionX
	let y = positionY
	const defWidth = 416
	const defHeigth = 500

	const windowWidth = window.innerWidth
	const windowHeight = window.innerHeight

	if (x + defWidth > windowWidth) {
		x = windowWidth - defWidth - 10
	}
	if (y + defHeigth > windowHeight) {
		y = windowHeight - defHeigth - 10
	}

	// dadosResponsavel.value = null
	modalPosition.x = x
	modalPosition.y = y
	clickedEvent.value = event
	visible.value = true

	const usuarioResponsavelId = clickedEvent.value.extendedProps
		.usuarioResponsavelId as string

	const participantesIds = clickedEvent?.value?.extendedProps
		?.participantsIds as string

	const promises = [getGuestsData(participantesIds.split(','))]

	// if (usuarioResponsavelId === usuario.value?.id) {
	// 	// dadosResponsavel.value = usuario.value
	// } else promises.push(fetchResponsibleData(usuarioResponsavelId))

	await Promise.all(promises)
}

const openConfirmDeleteModal = () => {
	deleteConfirmModal.value = true
}

const closeConfirmDeleteModal = () => {
	deleteConfirmModal.value = false
}

const confirmDelete = async () => {
	if (!clickedEvent?.value?.id) return

	const res = await $fetch.raw(
		`/api/v1/agendas/agenda-evento/${clickedEvent?.value?.id}/excluir`,
		{
			ignoreResponseError: false,
			method: 'DELETE',
		}
	)

	if (res.ok) {
		$toast.success('Evento deletado com sucesso')
		emits('refreshData')
	} else {
		$toast.error('Ocorreu um erro ao deletar este evento!')
	}
	closeConfirmDeleteModal()
	visible.value = false
}

defineExpose({openDetailsModal})
</script>

<style scoped></style>
