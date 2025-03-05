export enum EventPriority {
	HIGH = 'High',
	MEDIUM = 'Medium',
	LOW = 'Low',
}

export interface ICalendarEvent {
	id?: number
	name?: string
	description?: string
	priority?: EventPriority
	allDay?: boolean
	startDate?: Date
	endDate?: Date
	notify?: boolean
	recurrencyRule?: string
	calendarId?: number
	userId?: string
	participantsIds?: string
	color?: string
	deleted?: boolean
}
