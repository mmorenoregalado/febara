<script setup lang="ts">
	const { t } = useTranslations();

	useSeoMeta({
		title: t("admin.organizations.title"),
	});
</script>

<template>
	<AdminOrganizationList />
</template>
