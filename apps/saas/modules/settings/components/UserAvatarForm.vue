<script setup lang="ts">
	const toast = useToast();
	const { t } = useTranslations();

	const onSuccess = () => {
		toast.add({
			color: "success",
			title: t("settings.account.avatar.notifications.success"),
		});
	};

	const onError = () => {
		toast.add({
			color: "error",
			title: t("settings.account.avatar.notifications.error"),
		});
	};
</script>

<template>
	<SettingsItem
		:title="$t('settings.account.avatar.title')"
		:description="$t('settings.account.avatar.description')"
	>
		<UserAvatarUpload @success="onSuccess" @error="onError" />
	</SettingsItem>
</template>
