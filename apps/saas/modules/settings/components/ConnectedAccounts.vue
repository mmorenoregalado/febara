<script setup lang="ts">
	import { config as authConfig } from "@repo/auth/config";

	import { oAuthProviders } from "~/modules/auth/components/SocialSigninButton.vue";

	const { t } = useTranslations();
	const authClient = useAuthClient();

	const { data, isPending } = useUserAccountsQuery();

	const accounts = computed(() => data.value ?? []);

	const isProviderLinked = (provider: string) => {
		return accounts.value.some((account) => account.providerId === provider);
	};

	const linkProvider = (provider: string) => {
		const callbackURL = window.location.href;
		if (!isProviderLinked(provider)) {
			authClient.linkSocial({
				provider,
				callbackURL,
			});
		}
	};
</script>

<template>
	<SettingsItem
		v-if="authConfig.enableSocialLogin"
		:title="$t('settings.account.security.connectedAccounts.title')"
	>
		<div class="gap-4 grid grid-cols-1">
			<div
				v-for="[provider, providerData] in Object.entries(oAuthProviders)"
				:key="provider"
				class="gap-2 flex items-center justify-between"
			>
				<div class="gap-2 flex items-center">
					<component :is="providerData.icon" class="size-4 text-primary/50" />
					<span class="text-sm">{{ providerData.name }}</span>
				</div>
				<USkeleton v-if="isPending" class="h-10 w-28" />
				<UIcon
					v-else-if="isProviderLinked(provider)"
					name="i-lucide-check-circle-2"
					class="size-6 text-success"
				/>
				<UButton v-else variant="secondary" @click="linkProvider(provider)">
					<UIcon name="i-lucide-link" class="mr-1.5 size-4" />
					<span>
						{{ $t("settings.account.security.connectedAccounts.connect") }}
					</span>
				</UButton>
			</div>
		</div>
	</SettingsItem>
</template>
