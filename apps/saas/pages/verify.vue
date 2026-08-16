<script setup lang="ts">
	import { resolvePostLoginRedirect } from "~/modules/auth/lib/post-login-redirect";

	definePageMeta({
		layout: "default",
	});

	const { t } = useTranslations();
	const { public: config } = useRuntimeConfig();
	const { session, reloadSession } = useSession();
	const route = useRoute();

	const loading = ref(true);
	const authFailed = ref(false);
	const showOtpForm = ref(false);

	const { invitationRedirectPath } = useInvitationQuery();

	const redirectAfterLogin = computed(() =>
		resolvePostLoginRedirect({
			invitationRedirectPath: invitationRedirectPath.value,
			redirectToParam: route.query.redirectTo as string,
			redirectAfterSignIn: config.redirectAfterSignIn,
		}),
	);

	onMounted(async () => {
		await reloadSession();

		if (session.value) {
			navigateTo(redirectAfterLogin.value);
			return;
		}

		// Check for error from better-auth redirect (e.g. invalid token)
		const error = route.query.error as string | undefined;
		showOtpForm.value = !error && route.query.twoFactor === "true";
		authFailed.value = !showOtpForm.value;
		loading.value = false;
	});

	watch(session, (newSession) => {
		if (!loading.value) return;
		if (newSession) {
			navigateTo(redirectAfterLogin.value);
		}
	});

	const goToLogin = () => {
		navigateTo("/login");
	};

	useSeoMeta({
		title: t("auth.verifyPage.title"),
	});
</script>

<template>
	<div class="gap-4 flex flex-col items-center justify-center">
		<div v-if="loading" class="gap-4 flex flex-col items-center justify-center">
			<UIcon name="i-lucide-loader" class="size-6 animate-spin text-primary" />
			<p class="text-muted">
				{{ t("auth.verifyPage.authenticating") }}
			</p>
		</div>

		<OtpForm v-else-if="showOtpForm" />

		<div v-else-if="authFailed" class="gap-4 flex flex-col items-center justify-center text-center">
			<UAlert
				color="error"
				icon="i-lucide-alert-triangle"
				:title="t('auth.verifyPage.authFailed')"
				:description="t('auth.verifyPage.authFailedDescription')"
			/>
			<UButton variant="primary" @click="goToLogin">
				{{ t("auth.verifyPage.backToLogin") }}
			</UButton>
		</div>
	</div>
</template>
