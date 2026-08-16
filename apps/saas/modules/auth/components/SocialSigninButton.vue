<script lang="tsx">
	/** @jsxImportSource vue */
	import type { Component } from "vue";

	export const oAuthProviders: {
	  [key: string]: { name: string; icon: Component };
	} = {
	  google: {
	    name: "Google",
	    icon: ({ ...props }) => (
	      <svg viewBox="0 0 488 512" {...props}>
	        <path
	          d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
	          fill="currentColor"
	        />
	      </svg>
	    ),
	  },
	};
</script>

<script setup lang="tsx">
	const { provider, redirectTo } = defineProps<{
		provider: keyof typeof oAuthProviders;
		redirectTo: string;
	}>();

	const { t } = useTranslations();
	const authClient = useAuthClient();
	const toast = useToast();
	const router = useRouter();

	const loading = ref(false);

	const providerData = computed(() => {
		return oAuthProviders[provider];
	});

	// Route the OAuth callback through the verify page so the two-factor step is
	// honored: when 2FA is enabled Better Auth completes the OAuth callback
	// without an active session, and the verify page shows the OTP form instead
	// of bouncing the user to the login page.
	const callbackURL = computed(
		() =>
			router.resolve({
				path: "/verify",
				query: {
					redirectTo,
					twoFactor: "true",
				},
			}).href,
	);

	const onSignin = async () => {
		if (!providerData.value) return;

		loading.value = true;

		try {
			await authClient.signIn.social({
				provider: provider as string,
				callbackURL: callbackURL.value,
			});
		} catch (error) {
			toast.add({
				color: "error",
				title: t("auth.login.hints.socialSigninFailed"),
			});
		} finally {
			loading.value = false;
		}
	};
</script>

<template>
	<UButton
		v-if="providerData"
		variant="secondary"
		type="button"
		@click="onSignin"
		:loading="loading"
	>
		<component v-if="providerData.icon" :is="providerData.icon" class="mr-2 size-4 text-primary" />
		{{ providerData.name }}
	</UButton>
</template>
