<template>
	<Transition name="fade">
		<div
			v-if="user"
			class="m-6 p-6 border rounded-2xl shadow-lg flex justify-between items-center bg-white"
		>
			<span class="text-xl font-bold">Hello, {{ user?.fullName }} 👋</span>
			<div class="flex gap-4 transition-all">
				<Transition name="fade">
					<Icon
						v-if="calendarConfigOptions.showOnlyCalendar || isMobile"
						v-tooltip.bottom="'Add event'"
						name="mdi:plus"
						size="26"
						class="text-slate-600 cursor-pointer"
						@click="openAddEventModal"
					/>
				</Transition>
				<NuxtLink to="/what-is-this-calendar">
					<Icon
						v-tooltip.bottom="'Whats is this calendar?'"
						name="mdi:question-mark-circle-outline"
						size="26"
						class="text-slate-600 cursor-pointer"
					/>
				</NuxtLink>
				<Icon
					v-tooltip.bottom="'Settings'"
					name="mdi:cog-outline"
					size="26"
					class="text-slate-600 cursor-pointer"
					@click="toggle"
				/>
				<Popover ref="popoverRef">
					<div class="flex flex-col gap-4">
						<ul
							class="*:flex *:gap-2 *:transition-colors *:px-2 *:py-2 *:rounded-md *:text-sm"
						>
							<li
								class="hover:bg-green-50"
								v-if="!isMobile"
							>
								<Checkbox
									input-id="showOnlyCalendar"
									v-model="calendarConfigOptions.showOnlyCalendar"
									size="small"
									binary
								/>
								<label
									class="cursor-pointer"
									for="showOnlyCalendar"
									>Show only calendar</label
								>
							</li>
							<li class="hover:bg-green-50">
								<Checkbox
									input-id="showAllDayEvents"
									v-model="calendarConfigOptions.showAllDayEvents"
									size="small"
									binary
								/>
								<label
									class="cursor-pointer"
									for="showAllDayEvents"
									>Only all day events</label
								>
							</li>
							<li class="hover:bg-green-50">
								<Checkbox
									input-id="showWeekends"
									v-model="calendarConfigOptions.showWeekends"
									size="small"
									binary
								/>
								<label
									class="cursor-pointer"
									for="showWeekends"
									>Show weekends</label
								>
							</li>
						</ul>
					</div>
				</Popover>
			</div>
		</div>
	</Transition>
	<div class="m-6 p-4 rounded-2xl shadow-lg bg-white">
		<div
			ref="calendarContainer"
			class="flex h-full w-full"
			:class="{
				'flex-col mb-2': isMobile,
			}"
		>
			<Transition name="fade">
				<AppPartialCalendarSideBar
					v-show="!calendarConfigOptions.showOnlyCalendar"
					v-model:calendar="smallCalendarModel"
					v-model:selected-calendars="selectedCalendars"
					:calendars="configureCalendar"
					:loading="loadingCalendars"
					@add-event="openAddEventModal"
					@search-calendars="getCalendars"
					@change-calendar-view="changeViwer"
				/>
			</Transition>
			<div class="relative h-full w-full p-2">
				<div
					v-show="loadingEvents"
					class="absolute z-50 mt-20 flex h-[33rem] w-full items-center justify-center rounded-md bg-slate-100 opacity-50 2xl:h-full"
				>
					<Icon
						name="mingcute:loading-3-line"
						class="animate-spin"
						size="80"
					/>
				</div>
				<ClientOnly>
					<FullCalendar
						ref="fullCalendar"
						:options="fullcalendarProps"
					/>
				</ClientOnly>
			</div>
		</div>
		<div id="mobile-calendars"></div>
		<LazyAppPartialCalendarEventDetailsModal
			ref="eventDetailsModal"
			@refresh-event="openUpdateEventModal"
			@refresh-data="refreshEvents"
		/>
		<LazyAppPartialCalendarEventForm
			:id="updateEventId"
			v-model="addEventModalIsVisible"
			:calendars="allCalendars"
			:start-date="newEventDate.startDate"
			:end-date="newEventDate.endDate"
			@refresh-data="refreshEvents"
		/>
	</div>
	<div
		class="m-6 p-6 rounded-2xl flex justify-center items-center shadow-lg bg-white"
	>
		<span
			>© 2025 Developed by
			<a
				href="https://github.com/EduardoRocha234"
				target="_blank"
				class="hover:underline"
				>Eduardo Aleixo</a
			></span
		>
	</div>
</template>

<script setup lang="ts">
import {breakpointsTailwind, useStorage} from '@vueuse/core'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/light.css'
import type {
	CalendarOptions,
	DateSelectArg,
	DatesSetArg,
	EventDropArg,
	EventHoveringArg,
	EventInput,
} from '@fullcalendar/core'
import {driver} from 'driver.js'
import 'driver.js/dist/driver.css'
import type {
	ICalendar,
	ICalendarConfigForUser,
	ICalendarEvent,
	ICalendarMenus,
} from '~/interfaces'

const {$toast, $useConfirm, $dayjs} = useNuxtApp()
const user = useUser()

const popoverRef = useTemplateRef('popoverRef')
const fullCalendar = useTemplateRef('fullCalendar')
const eventDetailsModal = useTemplateRef('eventDetailsModal')
const calendarContainer = useTemplateRef('calendarContainer')
const isMobile = useBreakpoints(breakpointsTailwind).smallerOrEqual('md')
const loadingCalendars = ref<boolean>(false)
const loadingEvents = ref<boolean>(false)
const addEventModalIsVisible = ref<boolean>(false)
const smallCalendarModel = ref<Date | null>(null)
const events = ref<EventInput[]>([])
const selectedCalendars = ref<ICalendarMenus[]>([])
const allCalendars = ref<ICalendar[]>([])
const updateEventId = ref<string | null>(null)
const periodsSearched = ref<string[]>([])
const getEventParams = reactive<{
	calendarsIds: string
	startDate?: string
	endDate?: string
}>({
	calendarsIds: '',
	startDate: undefined,
	endDate: undefined,
})

const calendarTour = useStorage('tour-agenda', true)

const toggle = (event: Event) => {
	popoverRef.value?.toggle(event)
}

const configureCalendar = reactive<ICalendarConfigForUser>({
	userCalendars: [],
	othersCalendars: [],
})

const newEventDate = reactive<{
	startDate?: Date
	endDate?: Date
}>({
	startDate: undefined,
	endDate: undefined,
})

const calendarConfigOptions = useStorage('calendar-config', {
	showWeekends: true,
	showAllDayEvents: true,
	showOnlyCalendar: false,
})

const eventsFilter = computed(() => {
	if (!fullCalendar.value?.getApi()) return []

	const selectedCalendarsIds = new Set(selectedCalendars.value.map((a) => a.id))

	if (selectedCalendarsIds.size === 0) return []

	const filter = events.value.filter((e) =>
		selectedCalendarsIds.has(e.extendedProps?.calendarId)
	)

	return filter
})

const openEventPopup = (info: EventHoveringArg) => {
	tippy(info.el, {
		content: `
			<div style="min-width: 20rem">
				<strong>${info.event._def.title}</strong><br />
				<span><strong>Data Inicial:</strong> ${formatDate(
					info.event.start
				)}</span><br />
				<span><strong>Data Final:</strong> ${formatDate(
					adjustDateForShow(info.event.allDay, info.event.start, info.event.end)
				)}</span><br />
				<span><strong>Descrição:</strong> ${
					info.event._def.extendedProps.descricao || 'Sem descrição'
				}</span><br />

			</div>
			`,
		allowHTML: true,
		placement: 'auto',
		theme: 'light',
		interactive: true,
		onHidden(instance) {
			instance.hide()
			instance.destroy()
		},
	})
}

const formatDate = (data: Date | null) => {
	const formatedDate = $dayjs(data).format('DD/MM/YYYY HH:mm')

	if (formatedDate === 'Invalid Date') return ''

	return formatedDate.replace('00:00', '')
}

const adjustDateForShow = (
	allDay: boolean,
	startDate: Date | null,
	endDate: Date | null
) => {
	if (allDay) {
		return $dayjs(startDate).isSame(endDate, 'day')
			? new Date($dayjs(endDate).format('YYYY-MM-DD'))
			: $dayjs(endDate).subtract(1, 'day').toDate()
	}

	return $dayjs(endDate).toDate()
}

const openUpdateEventModal = (id: string) => {
	updateEventId.value = id
	addEventModalIsVisible.value = true
}

const openAddEventModal = (info?: DateSelectArg) => {
	updateEventId.value = null
	addEventModalIsVisible.value = true

	if (info) {
		newEventDate.startDate = $dayjs(info.startStr).toDate()
		newEventDate.endDate =
			info.view.type === 'dayGridMonth'
				? $dayjs(info.endStr).subtract(1, 'day').toDate()
				: $dayjs(info.endStr).toDate()
	} else {
		newEventDate.startDate = $dayjs().toDate()
		newEventDate.endDate = $dayjs().toDate()
	}
}

const fullcalendarProps = computed<CalendarOptions>(() => ({
	timeZone: 'local',
	plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
	initialView: 'dayGridMonth',
	headerToolbar: !isMobile.value
		? {
				left: 'prev,next today',
				center: 'title',
				right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
		  }
		: undefined,
	events: eventsFilter.value,
	dayMaxEventRows: 5,
	selectable: true,
	handleWindowResize: true,
	nowIndicator: true,
	firstDay: 0,
	editable: true,
	weekends: calendarConfigOptions.value.showWeekends,
	allDaySlot: calendarConfigOptions.value.showAllDayEvents,
	select: openAddEventModal,
	dayCellClassNames: (info) => {
		const day = info.date.getDay()
		if (day === 0 || day === 6) {
			return 'bg-green-50 text-slate-600'
		}
		return ''
	},
	eventClick: async (info) => {
		const offsetX = 400
		const offsetY = 150

		const x = info.jsEvent.clientX - offsetX
		const y = info.jsEvent.clientY - offsetY

		await eventDetailsModal.value?.openDetailsModal({
			positionX: x,
			positionY: y,
			event: info.event,
		})
	},
	eventMouseEnter: openEventPopup,
	datesSet: getEventsNextPeriod,
	eventDrop: async (event) => {
		const {openConfirmModal} = $useConfirm

		openConfirmModal({
			accept: async () => await updateEventDate(event),
			reject: () => event.revert(),
			message: 'Do you want to update the date of this event?',
			header: 'Update event',
		})
	},
}))

const updateEventDate = async (event: EventDropArg) => {
	const {
		_def: {publicId: id},
		start,
		end,
	} = event.oldEvent

	const {days, milliseconds, months, years} = event.delta

	const startDate = $dayjs(start)
		.add(years, 'year')
		.add(months, 'month')
		.add(days, 'day')
		.add(milliseconds, 'millisecond')
		.toISOString()

	const endDate = $dayjs(end)
		.add(years, 'year')
		.add(months, 'month')
		.add(days, 'day')
		.add(milliseconds, 'millisecond')
		.toISOString()

	const req = await $fetch.raw(`/api/calendar-event/update-date`, {
		method: 'PUT',
		body: {id, startDate, endDate},
		ignoreResponseError: true,
	})

	if (req.status === 200) {
		$toast.success('Event updated successfully')
		return
	}

	throw new Error((req._data as any).message)
}

const refreshEvents = async () => {
	periodsSearched.value = []
	events.value = []

	setPeriod()

	await getEvents()
}

const getEventsNextPeriod = async (e: DatesSetArg) => {
	const startDatePeriod = e.startStr
	const endDatePeriod = e.endStr

	if (
		periodsSearched.value.includes(startDatePeriod) &&
		periodsSearched.value.includes(endDatePeriod)
	)
		return

	getEventParams.startDate = startDatePeriod
	getEventParams.endDate = endDatePeriod

	periodsSearched.value.push(startDatePeriod)
	periodsSearched.value.push(endDatePeriod)

	await getEvents()
}

const getCalendars = async () => {
	periodsSearched.value = []

	try {
		loadingCalendars.value = true
		const res = await $fetch.raw<ICalendarConfigForUser>(
			`/api/calendar/configure`,
			{
				query: {
					userId: user.value?.id,
				},
				ignoreResponseError: false,
			}
		)

		if (res.ok) {
			const {userCalendars, othersCalendars} =
				res._data as ICalendarConfigForUser

			configureCalendar.userCalendars = userCalendars
			configureCalendar.othersCalendars = othersCalendars

			const unify = [...userCalendars, ...othersCalendars]

			allCalendars.value = unify

			const ids = unify.map((a) => a.id!).join(',')

			getEventParams.calendarsIds = ids

			setPeriod()
			await nextTick()
			await getEvents()
			return
		}

		$toast.error('An error occurred while trying to fetch your calendars')
	} catch (error) {
		$toast.error('An error occurred while trying to fetch your calendars')
	} finally {
		loadingCalendars.value = false
	}
}

const setPeriod = () => {
	if (fullCalendar.value?.getApi()) {
		const calendarApi = fullCalendar.value.getApi()
		const calendarView = calendarApi?.view
		const startDate = new Date(calendarView.activeStart).toISOString()
		const endDate = new Date(calendarView.activeEnd).toISOString()

		getEventParams.startDate = startDate
		getEventParams.endDate = endDate

		periodsSearched.value.push(startDate)
		periodsSearched.value.push(endDate)
	}
}

const getEvents = async () => {
	if (!getEventParams.calendarsIds) return

	try {
		loadingEvents.value = true
		const res = await $fetch.raw<ICalendarEvent[]>(
			'/api/calendar-event/list-by-calendars',
			{
				params: getEventParams,
				ignoreResponseError: false,
			}
		)

		if (res.ok) {
			const apiEvents = Array.isArray(res._data) ? res._data : []
			events.value = [...events.value, ...apiEvents.map(mapEventToFullCalendar)]
			return
		}
		$toast.error('An error occurred while fetching your events')
	} catch (error) {
		$toast.error('An error occurred while fetching your events')
	} finally {
		loadingEvents.value = false
	}
}

const calculateEndDate = (
	allDay: boolean,
	startDate?: Date,
	endDate?: Date
) => {
	if (allDay) {
		return $dayjs(startDate).isSame(endDate, 'day')
			? $dayjs(endDate).format('YYYY-MM-DD')
			: $dayjs(endDate).add(1, 'day').format('YYYY-MM-DD')
	}

	return endDate
}

const mapEventToFullCalendar = (e: ICalendarEvent) =>
	({
		id: e.id?.toString(),
		title: e.name,
		start: e.startDate ? $dayjs(e.startDate).format('YYYY-MM-DD') : e.startDate,
		end: calculateEndDate(e.allDay!, e.startDate, e.endDate),
		allDay: e.allDay,
		backgroundColor: e.color,
		extendedProps: {
			description: e.description,
			calendarId: e.calendarId,
			priority: e.priority,
			notify: e.notify,
			recurrencyRule: e.recurrencyRule,
			guestsIds: e.guestsIds,
			userId: e.userId,
		},
	} satisfies EventInput)

const changeViwer = (newView: string) => {
	if (fullCalendar.value && newView) {
		const calendarApi = fullCalendar.value.getApi()

		calendarApi.changeView(newView)
	}
}

watch(smallCalendarModel, (nv, ov) => {
	if (fullCalendar.value) {
		const newDate = nv ? new Date(nv).toISOString() : null
		const lastDate = ov ? new Date(ov).toISOString() : null
		const calendarApi = fullCalendar.value.getApi()

		if (newDate === lastDate) {
			calendarApi.changeView('dayGridMonth')
			return
		}

		calendarApi.gotoDate(nv as Date)
		calendarApi.changeView('timeGridDay')
	}
})

watch(
	() => calendarConfigOptions.value.showOnlyCalendar,
	useDebounceFn(() => {
		console.log('aqui')
		const calendarApi = fullCalendar?.value?.getApi()

		calendarApi?.updateSize()
	}, 500)
)

watch(user, (nv) => {
	if (nv) {
		console.log(nv)
		const driverObj = driver({
			showProgress: true,
			showButtons: ['next', 'close', 'previous'],
			steps: [
				{
					element: '#addEventBtn',
					popover: {
						title: 'Add Events',
						description: 'Click here to add events to your calendar',
					},
				},
				{
					element: '#smCalendar',
					popover: {
						title: 'Quick Navigation',
						description: 'Use this calendar to quickly access any day',
					},
				},
				{
					element: '#addCalendarBtn',
					popover: {
						title: 'Add Calendars',
						description: 'Click here to add calendars to organize your events',
					},
				},
				{
					element: '#My_Calendars',
					popover: {
						title: 'Your Calendars',
						description: 'Manage and control which calendars you want to view!',
					},
				},
				{
					element: '#Other_Calendars',
					popover: {
						title: 'Other Calendars',
						description: 'Here you will see calendars from other users',
					},
				},
				{
					element: '.fc-toolbar-chunk',
					popover: {
						title: 'Navigation',
						description: 'Use these buttons to navigate between months!',
					},
				},
				{
					element: '.fc-button-group:has(.fc-dayGridMonth-button)',
					popover: {
						title: 'View Mode',
						description:
							'Select your preferred view mode, with more details about the week, day, and a list of your events',
					},
				},
				{
					element: '.fc-dayGridMonth-view',
					popover: {
						title: 'Your Schedule',
						description:
							'View all your events easily, create events for any day with just one click, and manage everything quickly and efficiently',
					},
				},
			],
		})

		if (calendarTour.value) {
			driverObj.drive()
			calendarTour.value = false
		}
	}
})

onMounted(async () => {
	await getCalendars()
	await nextTick()
})
</script>

<style>
.fc .fc-toolbar.fc-header-toolbar {
	background-color: var(--p-gray-50); /* Fundo do cabeçalho */
	border-radius: 8px;
	padding: 10px;
}

.fc .fc-day-today {
	background-color: var(--p-emerald-50) !important;
}

.fc .fc-daygrid-day:hover {
	background-color: var(--p-emerald-100) !important;
}

.fc .fc-toolbar-title {
	color: var(--p-emerald-500); /* Cor do título */
	font-size: 18px;
	font-weight: bold;
	text-transform: uppercase;
}

.fc .fc-button {
	background-color: var(--p-emerald-500); /* Cor de fundo dos botões */
	color: white; /* Cor do texto */
	border: none;
	border-radius: 4px;
	padding: 5px 10px;
}

.fc .fc-button:hover {
	background-color: var(--p-emerald-600); /* Cor ao passar o mouse */
}

.fc .fc-button:active {
	background-color: var(--p-emerald-500) !important; /* Cor ao clicar */
}

.fc .fc-button.fc-button-active {
	background-color: var(--p-emerald-600) !important; /* Cor do botão ativo */
	color: white;
}

.fc .fc-button:disabled {
	background-color: #ccc; /* Cor do botão desativado */
	color: #666;
	cursor: not-allowed;
}

.fc-list,
.fc-timegrid,
.fc-daygrid {
	border-radius: 8px;
	border: 1px solid var(--p-indigo-100);
	overflow: hidden;
}

.fc-daygrid-day {
	border-right: 1px solid var(--p-indigo-100);
	border-bottom: 1px solid var(--p-indigo-100);
}
</style>
