<template>
	<div
		class="2xl:text-md mt-3 flex max-h-screen w-[30%] flex-col overflow-y-auto pr-2 text-sm scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300"
	>
		<!-- <LazyUiPartialSistemaAreaTrabalhoSkeletonLoader v-if="carregando" /> -->
		<template>
			<div>
				<Button
					id="addEventoBtn"
					outlined
					fluid
					@click="emits('addEvent')"
				>
					<Icon name="mdi:plus" />
					add Event
				</Button>
			</div>
			<div class="my-5">
				<DatePicker
					id="smcalendar"
					v-model="calendarModel"
					inline
					:show-week="false"
					size="small"
					class="w-full sm:w-[30rem]"
					:pt="CALENDAR_PT"
				/>
			</div>
			<div>
				<ClientOnly>
					<HeadlessDisclosure
						v-for="(agenda, idx) in menuCalendars"
						:key="idx"
						v-slot="{open}"
						as="div"
						default-open
						class="mb-3"
					>
						<HeadlessDisclosureButton
							:id="agenda.nome.replace(' ', '_')"
							as="div"
							class="2xl:text-md mb-2 flex w-full cursor-pointer select-none items-center justify-between rounded-md py-1 pl-2 pr-5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200"
						>
							{{ agenda.nome }}
							<div class="flex items-center gap-2 2xl:gap-4">
								<Icon
									v-if="agenda.nome === 'Minhas agendas'"
									id="addAgendaBtn"
									v-tooltip.top="'add agenda'"
									name="mdi:plus"
									size="26"
									@click.stop="openCalendarForm"
								/>
								<Icon
									name="weui:arrow-filled"
									size="26"
									:class="[
										!open && 'rotate-90 transition-transform',
										open && '-rotate-90 transition-transform',
									]"
								/>
							</div>
						</HeadlessDisclosureButton>
						<Transition
							enter-from-class="opacity-0 scale-y-[0.8]"
							enter-active-class="transition-[transform,opacity] duration-[120ms] ease-[cubic-bezier(0,0,0.2,1)]"
							leave-active-class="transition-opacity duration-100 ease-linear"
							leave-to-class="opacity-0"
						>
							<HeadlessDisclosurePanel
								class="flex max-h-60 flex-col overflow-y-auto scrollbar-thin 2xl:max-h-full"
								as="div"
							>
								<label
									v-for="itemAgenda in agenda.items"
									:key="itemAgenda.id"
									:for="`calendar_${itemAgenda.id}`"
									class="group flex h-9 w-full cursor-pointer items-center justify-between gap-4 rounded-md px-2 py-1 text-xs text-slate-600 transition-all hover:bg-slate-100 2xl:text-sm"
								>
									<span class="flex gap-2">
										<Checkbox
											v-model="selectedCalendars"
											:input-id="`calendar_${itemAgenda.id}`"
											:value="itemAgenda"
											:pt="{
												box: {
													style: {
														backgroundColor: itemAgenda.color,
														borderColor: itemAgenda.color,
													},
												},
											}"
										/>
										<span class="mt-1">
											{{ itemAgenda.name }}
										</span>
									</span>
									<button
										class="rounded-full p-1 transition-colors duration-200 ease-out active:bg-slate-300"
										@click.stop="openPopup($event, itemAgenda, agenda.nome)"
									>
										<Icon
											name="mdi:dots-vertical"
											size="20"
											class="hidden cursor-pointer transition-all group-hover:block"
											title="Opções"
										/>
									</button>
								</label>
							</HeadlessDisclosurePanel>
						</Transition>
					</HeadlessDisclosure>
				</ClientOnly>
				<Popover ref="popup">
					<ul
						class="w-full *:rounded-md *:px-2 *:py-1 *:text-sm *:transition-all"
					>
						<li
							class="flex cursor-pointer items-center gap-2 hover:bg-slate-100"
							@click="showOnlyOneCalendar"
						>
							<Icon
								name="mdi:eye-outline"
								class="text-slate-600"
							/>
							Exbir somente esta
							<Icon
								v-if="onlyOneCalendarSelected"
								name="mdi:check"
								class="text-blue-600"
							/>
						</li>
						<li
							v-if="calendarClickedOptions.menu !== 'Outras agendas'"
							class="flex cursor-pointer items-center gap-2 hover:bg-slate-100"
							@click="confirmDeleteModal = true"
						>
							<Icon
								name="mdi:trash-outline"
								class="text-slate-600"
							/>
							Apagar agenda
						</li>
						<li
							class="flex cursor-pointer items-center gap-2 hover:bg-slate-100"
							@click="openCalendarForm(false)"
						>
							<Icon
								name="mdi:info-outline"
								class="text-slate-600"
							/>
							Informações da agenda
						</li>
					</ul>
				</Popover>
			</div>
			<!-- <LazyUiPartialAgendaAgendaForm
				v-model="calendarFormVisible"
				:agenda-id="calendarClickedOptions.agenda?.id"
				@atualizar-dados="() => emits('searchCalendars')"
				@deletar="() => confirmDelete()"
			/>
			<LazyUiModalConfirmarExclusaoV1
				v-model="confirmDeleteModal"
				:on-close="() => closeDeleteModal()"
				:on-confirm="() => confirmDelete()"
				:loading-delete="loadingDelete"
			>
				<template #content>
					<div class="flex flex-col">
						<span>Deseja excluir esta agenda?</span>
						<span class="text-sm font-bold"
							>Ao excluir esta agenda todas as atividades relacionadas a ela
							serão excluidas!</span
						>
					</div>
				</template>
			</LazyUiModalConfirmarExclusaoV1> -->
		</template>
	</div>
</template>

<script setup lang="ts">
import type Popover from 'primevue/popover'
import type {
	ICalendar,
	ICalendarConfigForUser,
	ICalendarMenus,
} from '~/interfaces'

const props = defineProps<{
	calendars: ICalendarConfigForUser
	loading: boolean
}>()

const {calendars, loading} = toReactive(props)
const {$toast} = useNuxtApp()

const emits = defineEmits<{
	(evento: 'addEvent'): void
	(evento: 'searchCalendars'): void
}>()

const selectedCalendars = defineModel<ICalendarMenus[]>('selectedCalendars', {
	default: [],
})
const calendarModel = defineModel<Date | null>('calendar', {
	default: null,
})
const calendarFormVisible = ref<boolean>(false)
const confirmDeleteModal = ref<boolean>(false)
const loadingDelete = ref<boolean>(false)
const popup = ref<InstanceType<typeof Popover> | null>(null)

const calendarUsersMap = ref<ICalendarMenus[]>([])
const anotherCalendarsMap = ref<ICalendarMenus[]>([])

const calendarClickedOptions = reactive<{
	menu?: string
	calendar?: ICalendar
}>({})

const openPopup = (event: Event, calendar: ICalendar, menu: string) => {
	console.log(event)
	popup.value?.toggle(event)
	calendarClickedOptions.calendar = calendar
	calendarClickedOptions.menu = menu
}

const closeDeleteModal = () => {
	calendarClickedOptions.calendar = undefined
	calendarClickedOptions.menu = undefined
	confirmDeleteModal.value = false
}

const confirmDelete = async () => {
	if (!calendarClickedOptions?.calendar?.id) return

	loadingDelete.value = true
	const res = await $fetch.raw(
		`/api/calendar/${calendarClickedOptions.calendar.id}/excluir`,
		{
			ignoreResponseError: false,
			method: 'DELETE',
		}
	)
	loadingDelete.value = false

	if (res.ok) {
		// $toast.success('Agenda deletada com sucesso')
		emits('searchCalendars')
	}
	closeDeleteModal()
}

const onlyOneCalendarSelected = computed(() => {
	const filtraAgendasPorMenu = selectedCalendars.value.filter(
		(a) => a.menu === calendarClickedOptions.menu
	)
	return (
		filtraAgendasPorMenu.length === 1 &&
		filtraAgendasPorMenu[0].id === calendarClickedOptions.calendar!.id
	)
})

const showOnlyOneCalendar = () => {
	const allCalendars = [...calendarUsersMap.value, ...anotherCalendarsMap.value]

	selectedCalendars.value = allCalendars.filter(
		(a) =>
			a.id === calendarClickedOptions.calendar!.id ||
			a.menu !== calendarClickedOptions.menu
	)

	if (!selectedCalendars.value.length) {
		const getCalandar = allCalendars.find(
			(a) => a.id === calendarClickedOptions.calendar!.id
		)
		if (getCalandar) selectedCalendars.value = [getCalandar]
	}

	popup.value?.hide()
}

const menuCalendars = computed(() => {
	selectedCalendars.value = [
		...calendarUsersMap.value,
		...anotherCalendarsMap.value,
	]

	return [
		{nome: 'My Calendars', items: calendarUsersMap.value},
		{nome: 'Other Calendars', items: anotherCalendarsMap.value},
	]
})

const mapApiResponse = () => {
	const {userCalendars, othersCalendars} = calendars

	calendarUsersMap.value = userCalendars.map((a) => ({
		...a,
		menu: 'My Calendars',
	}))
	anotherCalendarsMap.value = othersCalendars.map((a) => ({
		...a,
		menu: 'Other Calendars',
	}))
}

const openCalendarForm = (add: boolean = true) => {
	if (add) {
		calendarClickedOptions.calendar = undefined
		calendarClickedOptions.menu = undefined
	}

	calendarFormVisible.value = true
}

watch(calendars, () => {
	mapApiResponse()
})

const CALENDAR_PT = {
	root: {
		class: '!text-xs !p-2',
	},
	monthTitle: {
		class: '!text-xs !font-semibold',
	},
	yearTitle: {
		class: '!text-xs !ml-1',
	},
	tableBody: {
		class: '!text-xs',
	},
	tableheaderrow: {
		class: '!hidden',
	},
	day: ({context}: any) => ({
		class: ['!p-1 !w-6 !h-6', {'!bg-green-700 !text-white': context.today}],
	}),
	dayLabel: ({context}: any) => ({
		class: ['!p-1 !w-6 !h-6 !rounded-md'],
	}),
}
</script>

<style scoped></style>
