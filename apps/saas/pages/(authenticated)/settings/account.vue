<script setup lang="ts">
	definePageMeta({
		layout: "app",
	});
</script>

<template>
	<UPageHeader
		:title="$t('settings.account.title')"
		:description="$t('settings.account.subtitle')"
		class="mb-8 pt-0"
	/>

	<NuxtPage />
</template>
