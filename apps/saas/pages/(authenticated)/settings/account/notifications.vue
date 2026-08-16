<script setup lang="ts">
	const { t } = useTranslations();
	const { user } = useSession();

	useSeoMeta({
		title: t("settings.notificationsPage.title"),
	});

	watchEffect(() => {
		if (!user.value) {
			navigateTo("/login");
		}
	});
</script>

<template>
	<SettingsList v-if="user">
		<NotificationPreferencesForm />
	</SettingsList>
</template>
