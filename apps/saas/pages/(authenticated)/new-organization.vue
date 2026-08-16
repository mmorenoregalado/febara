<script setup lang="ts">
	const { t } = useTranslations();
	const { user, prefetchSession } = useSession();

	await prefetchSession();

	if (!user.value) {
		await navigateTo("/login");
	}

	useSeoMeta({
		title: t("organizations.createForm.title"),
	});
</script>

<template>
	<CreateOrganizationForm />
</template>
