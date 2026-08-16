<script setup lang="ts">
	const { t } = useTranslations();

	useSeoMeta({
		title: t("admin.users.title"),
	});
</script>

<template>
	<AdminUserList />
</template>
