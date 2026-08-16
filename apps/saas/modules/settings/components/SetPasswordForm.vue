<script setup lang="ts">
	const { t } = useTranslations();
	const { user } = useSession();
	const authClient = useAuthClient();
	const toast = useToast();

	const isSubmitting = ref(false);

	const sendSetPasswordEmail = async () => {
		if (!user.value?.email) {
			return;
		}

		isSubmitting.value = true;

		try {
			await authClient.requestPasswordReset({
				email: user.value.email,
				redirectTo: "/reset-password",
			});

			toast.add({
				color: "success",
				title: t("settings.account.security.setPassword.notifications.success"),
			});
		} catch {
			toast.add({
				color: "error",
				title: t("settings.account.security.setPassword.notifications.error"),
			});
		} finally {
			isSubmitting.value = false;
		}
	};
</script>

<template>
	<SettingsItem
		:title="$t('settings.account.security.setPassword.title')"
		:description="$t('settings.account.security.setPassword.description')"
	>
		<div class="flex justify-start">
			<UButton type="button" :loading="isSubmitting" @click="sendSetPasswordEmail">
				{{ $t("settings.account.security.setPassword.submit") }}
			</UButton>
		</div>
	</SettingsItem>
</template>
