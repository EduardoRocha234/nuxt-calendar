import Lara from '@primevue/themes/lara'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devtools: {enabled: true},
	components: [
		{path: 'components/', prefix: 'App'},
		{path: 'partials/', prefix: 'AppPartial'},
	],
	typescript: {
		strict: true,
	},
	modules: [
		'@nuxt/icon',
		'@nuxtjs/tailwindcss',
		'nuxt-headlessui',
		'@vueuse/nuxt',
		'@primevue/nuxt-module',
		'dayjs-nuxt',
		[
			'@nuxtjs/google-fonts',
			{
				families: {
					Montserrat: true,
					Inter: [400, 700],
					'Josefin+Sans': true,
					Lato: [100, 300],
				},
			},
		],
	],
	css: ['./assets/css/global.css'],
	icon: {
		size: '20px',
	},
	headlessui: {
		prefix: 'Headless',
	},
	primevue: {
		options: {
			theme: {
				preset: Lara,
				options: {
					darkModeSelector: '.dark-mode',
				},
			},
		},
	},
	tailwindcss: {
		editorSupport: true,
	},
	vueuse: {
		autoImports: true,
	},
	vite: {
		optimizeDeps: {
			include: ['tippy.js'],
		},
	},
	compatibilityDate: '2025-03-09',
})
