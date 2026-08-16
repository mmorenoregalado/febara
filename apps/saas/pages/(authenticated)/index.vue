<script setup lang="ts">
	const { t } = useTranslations();
	const { session, user } = useSession();

	definePageMeta({
		layout: "app",
	});

	useSeoMeta({
		title: t("app.menu.start"),
	});

	if (!session.value) {
		await navigateTo("/login");
	}
</script>

<template>
	<UPageHeader
		:title="t('start.welcome', { name: user?.name })"
		:description="t('start.subtitle')"
		class="mb-8 pt-0"
	/>

	<UserStart />
</template>
