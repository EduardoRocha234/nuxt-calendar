export interface ICalendar {
	id?: number
	name?: string
	color?: string
	description?: string
	userId?: number
}

export interface ICalendarConfigForUser {
	userCalendars: ICalendar[]
	othersCalendars: ICalendar[]
}

export interface ICalendarMenus extends ICalendar {
	menu: string
}
