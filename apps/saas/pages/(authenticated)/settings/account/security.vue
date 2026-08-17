<script setup lang="ts">
	import { config as authConfig } from "@repo/auth/config";

	const { t } = useTranslations();
	const headers = useRequestHeaders();
	const authClient = useAuthClient();
	const queryClient = useQueryClient();

	await queryClient.prefetchQuery({
		queryKey: userAccountQueryKey,
		queryFn: () =>
			authClient.listAccounts({
				fetchOptions: {
					headers,
				},
			}),
	});

	const { data: accounts, isPending: accountsPending } = useUserAccountsQuery();

	const userHasPassword = computed(() =>
		accounts.value?.some((account) => account.providerId === "credential"),
	);

	useSeoMeta({
		title: t("settings.account.security.title"),
	});
</script>

<template>
	<SettingsList>
		<template v-if="authConfig.enablePasswordLogin && !accountsPending">
			<ChangePasswordForm v-if="userHasPassword" />
			<SetPasswordForm v-else />
		</template>
		<Passkeys />
		<TwoFactorAuthentication />
		<ActiveSessions />
	</SettingsList>
</template>
