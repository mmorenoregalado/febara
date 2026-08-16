<script setup lang="ts">
	const { t } = useTranslations();
	const { user } = useSession();

	if (!user.value) {
		await navigateTo("/login");
	}

	if (user.value!.onboardingComplete) {
		await navigateTo("/");
	}

	useSeoMeta({
		title: t("onboarding.title"),
	});
</script>

<template>
	<OnboardingForm />
</template>
