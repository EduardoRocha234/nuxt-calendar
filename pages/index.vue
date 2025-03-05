<template>
	<div class="p-6">
		<!-- <UiSectionCard> -->
		<!-- <template #header>
				<ClientOnly>
					<LazyUiPartialSistemaAreaTrabalhoCabecalho
						v-model:somente-agenda="opcoesConfiguracao.somenteAgenda"
						v-model:mostrar-fins-de-semana="
							opcoesConfiguracao.mostrarFinsDeSemana
						"
						v-model:mostrar-eventos-dia-inteiro="
							opcoesConfiguracao.mostrarEventosDiaInteiro
						"
						@add-atividade="abrirModalAdicionarEvento"
					/>
				</ClientOnly>
			</template> -->
		<div
			ref="calendarContainer"
			class="flex h-full w-full"
		>
			<KeepAlive>
				<LazyAppPartialCalendarSideBar
					v-if="!opcoesConfiguracao.somenteAgenda"
					v-model:calendar="calendarioMenorModel"
					v-model:selected-calendars="agendasSelecionadas"
					:calendars="configuraAgenda"
					:loading="carregandoAgendas"
					@add-event="abrirModalAdicionarEvento"
					@search-calendars="fethAgendas"
				/>
			</KeepAlive>
			<div class="relative h-full w-full p-2">
				<div
					v-show="carregandoEventos"
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
		<!-- </UiSectionCard> -->
		<!-- <LazyUiPartialSistemaAreaTrabalhoModalDetalhesEvento
			ref="modalDetalhesEvento"
			@atualizar-evento="abrirModalAtualizarEvento"
			@atualizar-dados="recarregarEventos"
		/> -->
		<LazyAppPartialCalendarEventForm
			:id="idEventoEditar"
			v-model="modalAdicionarAtividadeVisivel"
			:calendars="todasAgendas"
			:star-date="novoEventoData.dataInicio"
			:end-date="novoEventoData.dataTermino"
			@refresh-data="recarregarEventos"
		/>
	</div>
</template>

<script setup lang="ts">
import {useStorage} from '@vueuse/core'
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

const {$toast} = useNuxtApp()
const dayjs = useDayjs()

const carregandoAgendas = ref<boolean>(false)
const carregandoEventos = ref<boolean>(false)
const modalAdicionarAtividadeVisivel = ref<boolean>(false)
const fullCalendar = ref<InstanceType<typeof FullCalendar> | null>(null)
const calendarContainer = ref<HTMLElement | null>(null)
const calendarioMenorModel = ref<Date | null>(null)
const eventos = ref<EventInput[]>([])
const agendasSelecionadas = ref<ICalendarMenus[]>([])
const todasAgendas = ref<ICalendar[]>([])
// const modalDetalhesEvento = ref<InstanceType<
// 	typeof ModalDetalhesEvento
// > | null>(null)
const idEventoEditar = ref<string | null>(null)
const parametrosGetEvento = reactive<{
	agendasIds: string
	dataInicial?: string
	dataFinal?: string
}>({
	agendasIds: '',
	dataInicial: undefined,
	dataFinal: undefined,
})
const periodosJaBuscados = ref<string[]>([])

const configuraAgenda = reactive<ICalendarConfigForUser>({
	userCalendars: [],
	othersCalendars: [],
})

const novoEventoData = reactive<{
	dataInicio?: Date
	dataTermino?: Date
}>({
	dataInicio: undefined,
	dataTermino: undefined,
})

const opcoesConfiguracao = useStorage('configuracoes-calendario', {
	mostrarFinsDeSemana: true,
	mostrarEventosDiaInteiro: true,
	somenteAgenda: false,
})
const tourPelaAgenda = useStorage('tour-agenda', true)

const eventosFilter = computed(() => {
	if (!fullCalendar.value?.getApi()) return []

	const agendasSelecionadasIds = new Set(
		agendasSelecionadas.value.map((a) => a.id)
	)

	if (agendasSelecionadasIds.size === 0) return []

	const filter = eventos.value.filter((e) =>
		agendasSelecionadasIds.has(e.extendedProps?.calendarId)
	)

	return filter
})

const abrirPopupEvento = (info: EventHoveringArg) => {
	tippy(info.el, {
		content: `
			<div style="min-width: 20rem">
				<strong>${info.event._def.title}</strong><br />
				<span><strong>Data Inicial:</strong> ${formatarData(
					info.event.start
				)}</span><br />
				<span><strong>Data Final:</strong> ${formatarData(
					ajustarDataParaExibicao(
						info.event.allDay,
						info.event.start,
						info.event.end
					)
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

const formatarData = (data: Date | null) => {
	const dataFormatada = dayjs(data).format('DD/MM/YYYY HH:mm')

	if (dataFormatada === 'Invalid Date') return ''

	return dataFormatada.replace('00:00', '')
}

const ajustarDataParaExibicao = (
	diaInteiro: boolean,
	dataInicio: Date | null,
	dataTermino: Date | null
) => {
	if (diaInteiro) {
		return dayjs(dataInicio).isSame(dataTermino, 'day')
			? new Date(dayjs(dataTermino).format('YYYY-MM-DD'))
			: dayjs(dataTermino).subtract(1, 'day').toDate()
	}

	return dayjs(dataTermino).toDate()
}

const abrirModalAtualizarEvento = (id: string) => {
	idEventoEditar.value = id
	modalAdicionarAtividadeVisivel.value = true
}

const abrirModalAdicionarEvento = (info?: DateSelectArg) => {
	idEventoEditar.value = null
	modalAdicionarAtividadeVisivel.value = true

	if (info) {
		novoEventoData.dataInicio = dayjs(info.startStr).toDate()
		novoEventoData.dataTermino =
			info.view.type === 'dayGridMonth'
				? dayjs(info.endStr).subtract(1, 'day').toDate()
				: dayjs(info.endStr).toDate()
	} else {
		novoEventoData.dataInicio = dayjs().toDate()
		novoEventoData.dataTermino = dayjs().toDate()
	}
}

const fullcalendarProps = computed<CalendarOptions>(() => ({
	timeZone: 'local',
	plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
	initialView: 'dayGridMonth',
	headerToolbar: {
		left: 'prev,next today',
		center: 'title',
		right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
	},
	// locale: 'pt-BR',
	events: eventosFilter.value,
	dayMaxEventRows: 5,
	selectable: true,
	handleWindowResize: true,
	nowIndicator: true,
	firstDay: 0,
	weekends: opcoesConfiguracao.value.mostrarFinsDeSemana,
	allDaySlot: opcoesConfiguracao.value.mostrarEventosDiaInteiro,
	select: abrirModalAdicionarEvento,
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

		// await modalDetalhesEvento.value?.abrirModalDetalhesEvento({
		// 	posicaoX: x,
		// 	posicaoY: y,
		// 	evento: info.event,
		// })
	},
	eventMouseEnter: abrirPopupEvento,
	datesSet: buscarEventosProximoPeriodo,
}))

const recarregarEventos = async () => {
	periodosJaBuscados.value = []
	eventos.value = []

	setPeriodo()

	await buscarEventos()
}

const buscarEventosProximoPeriodo = async (e: DatesSetArg) => {
	const periodoDataInicio = e.startStr
	const periodoDataFim = e.endStr

	if (
		periodosJaBuscados.value.includes(periodoDataInicio) &&
		periodosJaBuscados.value.includes(periodoDataFim)
	)
		return

	parametrosGetEvento.dataInicial = periodoDataInicio
	parametrosGetEvento.dataFinal = periodoDataFim

	periodosJaBuscados.value.push(periodoDataInicio)
	periodosJaBuscados.value.push(periodoDataFim)

	await buscarEventos()
}

const fethAgendas = async () => {
	periodosJaBuscados.value = []

	const parametros = {
		userId: 1,
	}

	try {
		carregandoAgendas.value = true
		const res = await $fetch.raw<ICalendarConfigForUser>(
			`/api/calendar/configure`,
			{
				query: parametros,
				ignoreResponseError: false,
			}
		)

		if (res.ok) {
			const {userCalendars, othersCalendars} =
				res._data as ICalendarConfigForUser

			configuraAgenda.userCalendars = userCalendars
			configuraAgenda.othersCalendars = othersCalendars

			const unificar = [...userCalendars, ...othersCalendars]

			todasAgendas.value = unificar

			const pegarIds = unificar.map((a) => a.id!).join(',')

			parametrosGetEvento.agendasIds = pegarIds

			setPeriodo()
			await buscarEventos()

			return
		}

		// $toast.error('Ocorreu um erro inesperado ao buscar as agendas')
	} catch (error) {
		// $toast.error('Ocorreu um erro inesperado ao buscar as agendas')
	} finally {
		carregandoAgendas.value = false
	}
}

const setPeriodo = () => {
	if (fullCalendar.value?.getApi()) {
		const calendarApi = fullCalendar.value.getApi()
		const calendarioView = calendarApi?.view
		const dataInicio = new Date(calendarioView.activeStart).toISOString()
		const dataFim = new Date(calendarioView.activeEnd).toISOString()

		parametrosGetEvento.dataInicial = dataInicio
		parametrosGetEvento.dataFinal = dataFim

		periodosJaBuscados.value.push(dataInicio)
		periodosJaBuscados.value.push(dataFim)
	}
}

const buscarEventos = async () => {
	if (!parametrosGetEvento.agendasIds) return

	try {
		carregandoEventos.value = true
		const res = await $fetch.raw<ICalendarEvent[]>(
			'/api/calendar-event/list-by-calendars',
			{
				params: parametrosGetEvento,
				ignoreResponseError: false,
			}
		)

		if (res.ok) {
			const eventosApi = Array.isArray(res._data) ? res._data : []
			eventos.value = [
				...eventos.value,
				...eventosApi.map(mapearParaEventoFullCalendar),
			]
			return
		}
		// $toast.error('Ocorreu um erro inesperado ao buscar seus eventos')
	} catch (error) {
		// $toast.error('Ocorreu um erro inesperado ao buscar seus eventos')
	} finally {
		carregandoEventos.value = false
	}
}

const calcularDataTermino = (
	diaInteiro: boolean,
	dataInicio?: Date,
	dataTermino?: Date
) => {
	// Caso seja um evento de dia inteiro
	if (diaInteiro) {
		return dayjs(dataInicio).isSame(dataTermino, 'day')
			? dayjs(dataTermino).format('YYYY-MM-DD') // Não adiciona dia extra se for o mesmo dia
			: dayjs(dataTermino).add(1, 'day').format('YYYY-MM-DD') // Adiciona dia extra se for de múltiplos dias
	}

	// Caso seja um evento com hora definida
	return dataTermino
}

const mapearParaEventoFullCalendar = (e: ICalendarEvent) =>
	({
		id: e.id?.toString(),
		title: e.name,
		start: e.startDate ? dayjs(e.startDate).format('YYYY-MM-DD') : e.startDate,
		end: calcularDataTermino(e.allDay!, e.startDate, e.endDate),
		allDay: e.allDay,
		backgroundColor: e.color,
		extendedProps: {
			descricao: e.description,
			calendarId: e.calendarId,
			priority: e.priority,
			notify: e.notify,
			recurrencyRule: e.recurrencyRule,
			participantsIds: e.participantsIds,
			userId: e.userId,
		},
	} satisfies EventInput)

watch(calendarioMenorModel, (nv, ov) => {
	if (fullCalendar.value) {
		const novaData = nv ? new Date(nv).toISOString() : null
		const dataAnterior = ov ? new Date(ov).toISOString() : null
		const calendarApi = fullCalendar.value.getApi()

		if (novaData === dataAnterior) {
			calendarApi.changeView('dayGridMonth')
			return
		}

		calendarApi.gotoDate(nv as Date)
		calendarApi.changeView('timeGridDay')
	}
})

watch(
	() => opcoesConfiguracao.value.somenteAgenda,
	useDebounceFn(() => {
		const calendarApi = fullCalendar?.value?.getApi()

		calendarApi?.updateSize()
	}, 50)
)

onMounted(async () => {
	if (!carregandoAgendas.value) await fethAgendas()

	// const driverObj = driver({
	// 	showProgress: true,
	// 	showButtons: ['next', 'close', 'previous'],
	// 	nextBtnText: 'Próximo',
	// 	prevBtnText: 'Anterior',
	// 	doneBtnText: 'Entendi',
	// 	progressText: '{{current}} de {{total}}',
	// 	steps: [
	// 		{
	// 			element: '#addEventoBtn',
	// 			popover: {
	// 				title: 'Adicionar eventos',
	// 				description: 'Clique aqui para adicionar eventos ao seu calendário',
	// 			},
	// 		},
	// 		{
	// 			element: '#smcalendar',
	// 			popover: {
	// 				title: 'Navegação rápida',
	// 				description:
	// 					'Use este calendário para acessar qualquer dia mais rapidamente',
	// 			},
	// 		},
	// 		{
	// 			element: '#addAgendaBtn',
	// 			popover: {
	// 				title: 'Adicionar agendas',
	// 				description:
	// 					'Clique aqui para adicionar agendas ao seu calendário e use-as para organizar seus eventos',
	// 			},
	// 		},
	// 		{
	// 			element: '#Minhas_agendas',
	// 			popover: {
	// 				title: 'Suas agendas',
	// 				description:
	// 					'Gerencie e controle quais agendas você quer vizualizar!',
	// 			},
	// 		},
	// 		{
	// 			element: '#Outras_agendas',
	// 			popover: {
	// 				title: 'Outras agendas',
	// 				description:
	// 					'Aqui aparecerão agendas de seus gestores, equipes e outros usuários',
	// 			},
	// 		},
	// 		{
	// 			element: '.fc-toolbar-chunk',
	// 			popover: {
	// 				title: 'Navegação',
	// 				description: 'Use esses botões para navegar entre os meses!',
	// 			},
	// 		},
	// 		{
	// 			element: '.fc-button-group:has(.fc-dayGridMonth-button)',
	// 			popover: {
	// 				title: 'Modo de vizualização',
	// 				description:
	// 					'Selecione o modo de vizualização que você preferir, com mais detalhes sobre a semana, dia e uma lista dos seus eventos',
	// 			},
	// 		},
	// 		{
	// 			element: '.fc-dayGridMonth-view',
	// 			popover: {
	// 				title: 'Sua agenda',
	// 				description:
	// 					'Vizualize todos os seus eventos de forma prática, crie eventos para qualquer dia com apenas um clique e gerencie tudo de forma rápida e prática',
	// 			},
	// 		},
	// 		{
	// 			element: '#barraFerramentas',
	// 			popover: {
	// 				title: 'Barra de ferramentas',
	// 				description:
	// 					'Aqui você tem botões de ferramentas como relatório, opcões de configuração e mais!',
	// 			},
	// 		},
	// 	],
	// })

	// if (tourPelaAgenda.value) {
	// 	driverObj.drive()
	// 	tourPelaAgenda.value = false
	// }
})
</script>

<style>
.fc .fc-toolbar.fc-header-toolbar {
	background-color: var(--p-indigo-50); /* Fundo do cabeçalho */
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
