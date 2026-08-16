<script setup lang="ts">
	const { t } = useTranslations();
	const { user } = useSession();

	useSeoMeta({
		title: t("settings.account.title"),
	});

	watchEffect(() => {
		if (!user.value) {
			navigateTo("/login");
		}
	});
</script>

<template>
	<SettingsList v-if="user">
		<UserAvatarForm />
		<UserLanguageForm />
		<ChangeNameForm :initialValue="user.name || ''" />
		<ChangeEmailForm />
		<DeleteAccountForm />
	</SettingsList>
</template>
