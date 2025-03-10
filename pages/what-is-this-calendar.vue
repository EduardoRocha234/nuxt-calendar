<template>
	<div
		class="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-100"
	>
		<NuxtLink
			class="fixed top-5 left-5 flex items-center gap-2 cursor-pointer text-green-600"
			to="/"
		>
			<Icon
				name="mdi:arrow-left"
				size="30"
			/>
			Back
		</NuxtLink>
		<div class="max-w-3xl w-full bg-white p-6 rounded-2xl shadow-lg">
			<h1 class="text-3xl font-bold text-emerald-600 mb-4">Calendar Project</h1>
			<p class="text-gray-700 mb-4">
				This is a study and improvement project inspired by Google Calendar.
				Developed with
				<a
					href="https://nuxt.com/"
					target="_blank"
					rel="noopener noreferrer"
					class="hover:underline"
				>
					<strong class="text-emerald-600">Nuxt 3</strong> </a
				>, styled with
				<a
					href="https://tailwindcss.com/"
					target="_blank"
					rel="noopener noreferrer"
					class="hover:underline"
					><strong class="text-emerald-600">Tailwind CSS</strong></a
				>
				, and using components from
				<a
					href="https://primevue.org/"
					target="_blank"
					rel="noopener noreferrer"
					class="hover:underline"
				>
					<strong class="text-emerald-600">PrimeVue</strong>
				</a>
				and
				<a
					href="https://fullcalendar.io/"
					target="_blank"
					rel="noopener noreferrer"
					class="hover:underline"
				>
					<strong class="text-emerald-600">FullCalendar</strong>
				</a>
				.
			</p>
			<p class="text-gray-700 mb-4">
				The backend is simulated using Nuxt's built-in server and an
				<strong class="text-emerald-600">in-memory SQLite</strong> database,
				ensuring fast development without the need for complex infrastructure.
			</p>
			<p class="text-gray-700">
				The main goal of this project was to enhance knowledge in
				<a
					href="https://nuxt.com/"
					target="_blank"
					rel="noopener noreferrer"
					class="hover:underline"
				>
					<strong class="text-emerald-600">Nuxt.js</strong> </a
				>, handling data in a temporary database, and integrating with popular
				libraries.
			</p>
		</div>
	</div>
</template>

<script setup></script>
