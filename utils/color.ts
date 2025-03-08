export const generateRandomColor = () => {
	const r = Math.floor(Math.random() * 256)
	const g = Math.floor(Math.random() * 256)
	const b = Math.floor(Math.random() * 256)
	return `rgb(${r}, ${g}, ${b})`
}

export const getRandomHexColor = () =>
	`#${Math.floor(Math.random() * 16777215)
		.toString(16)
		.padStart(6, '0')}`
