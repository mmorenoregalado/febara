<script setup lang="ts">
	definePageMeta({
		layout: "app",
	});

	const { activeOrganization } = useActiveOrganization();
	const { check } = usePermissions();

	if (!activeOrganization.value) {
		await navigateTo("/");
	} else if (!check("organization.manage")) {
		await navigateTo(`/${activeOrganization.value.slug}`, { replace: true });
	}
</script>

<template>
	<UPageHeader
		:title="$t('organizations.settings.title')"
		:description="$t('organizations.settings.subtitle')"
		class="mb-8 pt-0"
	/>

	<NuxtPage />
</template>
