export interface ICalendar {
	id?: string
	name?: string
	color?: string
	description?: string
	userId?: string
}

export interface ICalendarConfigForUser {
	userCalendars: ICalendar[]
	othersCalendars: ICalendar[]
}
