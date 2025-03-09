import type { Weekday } from "rrule"

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
	userId?: number
	guestsIds?: string
	color?: string
	deleted?: boolean
}

export type FrequencyString =
	| 'HOURLY'
	| 'DAILY'
	| 'WEEKLY'
	| 'MONTHLY'
	| 'YEARLY'

export type WeekDayOp = {
	name: string
	value: Weekday
}

export interface IRecurrencyForm {
	recurrency: FrequencyString
	repeatForEach: number
	repeatDay?: WeekDayOp[]
	endType?: 'never' | 'date' | 'occurrences'
	endDate?: Date
	occurrenceNumber?: number
	mounthDay?: number
	mounth?: number
}
