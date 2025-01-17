import Lara from '@primevue/themes/lara'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2024-11-01',
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
	],
	css: [
		'./assets/css/base.css',
		'./assets/css/tailwind.css',
		'./assets/css/global.css',
	],
	build: {
		transpile: ['vue-toastification'],
	},
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
			},
		},
	},
	tailwindcss: {
		cssPath: ['./assets/css/tailwind.css', {injectPosition: 'first'}],
		configPath: './tailwind.config.js',
		editorSupport: true,
		viewer: false,
	},
	vueuse: {
		autoImports: true,
	},
	vite: {
		optimizeDeps: {
			include: ['tippy.js'],
		},
	},
})
