type OperatorType = '<' | '>' | '<=' | '>=' | '=='

export const validateDate = (
	date1: Date,
	operator: OperatorType,
	date2: Date
) => {
	if (!date1 || !date2) return false

	if (operator === '<=' || operator === '==' || operator === '>=') {
		const date1WithotHour = date1.toISOString().split('T')[0]
		const date2WithoutHour = date2.toISOString().split('T')[0]

		if (date1WithotHour === date2WithoutHour) {
			return true
		}
	}

	switch (operator) {
		case '<':
			return date1 < date2
		case '>':
			return date1 > date2
		case '<=':
			return date1 <= date2
		case '>=':
			return date1 >= date2
		default:
			return true
	}
}
