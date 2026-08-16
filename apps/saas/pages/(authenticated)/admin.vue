<script setup lang="ts">
	import { checkPermission } from "@repo/permissions";

	definePageMeta({
		layout: "app",
	});

	const { t } = useTranslations();
	const { user, prefetchSession } = useSession();

	await prefetchSession();

	// admin.access is user-scoped — evaluate from the session user directly so
	// this page does not depend on setup()/isReady timing.
	if (!user.value || !checkPermission({ user: user.value }, "admin.access")) {
		await navigateTo("/");
		throw new Error("No admin role");
	}

	useSeoMeta({
		title: () => t("admin.title"),
		description: () => t("admin.description"),
	});
</script>

<template>
	<div>
		<UPageHeader
			:title="t('admin.title')"
			:description="t('admin.description')"
			:ui="{
				root: 'mb-0 border-default !pb-6 !border-b border-b',
			}"
			class="pt-0"
		/>

		<div class="pt-6">
			<NuxtPage />
		</div>
	</div>
</template>
