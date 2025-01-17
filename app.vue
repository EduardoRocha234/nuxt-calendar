<template>
	<div>
		<!-- <NuxtRouteAnnouncer />
    <NuxtWelcome /> -->

		<Button
			label="Verify"
			@click="test"
		/>
	</div>
</template>

<script setup lang="ts">
provideHeadlessUseId(() => useId())

const test = async () => {
	const res = await $fetch.raw('/api/users')

	console.log(res)
}
</script>
