<script setup lang="ts">
	const { t } = useTranslations();

	useSeoMeta({
		title: t("auth.resetPassword.title"),
	});
</script>

<template>
	<ResetPasswordForm />
</template>
