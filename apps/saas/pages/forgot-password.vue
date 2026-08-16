<script setup lang="ts">
	const { t } = useTranslations();

	useSeoMeta({
		title: t("auth.forgotPassword.title"),
	});
</script>

<template>
	<ForgotPasswordForm />
</template>
