<script setup lang="ts">
	import { resolvePostLoginRedirect } from "~/modules/auth/lib/post-login-redirect";

	const { t } = useTranslations();
	const { public: config } = useRuntimeConfig();
	const { user } = useSession();
	const { invitationRedirectPath } = useInvitationQuery();
	const redirectToParam = useRouteQueryParam("redirectTo");

	watch(
		user,
		() => {
			if (user.value) {
				navigateTo(
					resolvePostLoginRedirect({
						invitationRedirectPath: invitationRedirectPath.value,
						redirectToParam: redirectToParam.value,
						redirectAfterSignIn: config.redirectAfterSignIn,
					}),
				);
			}
		},
		{ immediate: true },
	);

	useSeoMeta({
		title: t("auth.login.title"),
	});
</script>

<template>
	<LoginForm />
</template>
