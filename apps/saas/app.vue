<script setup lang="ts">
	import type { PermissionsDefinition } from "@repo/permissions";
	import type { Permix } from "permix";
	import { PermixProvider } from "permix/vue";

	const appName = useRuntimeConfig().public.appName;

	const defaultIconLinks = [{ rel: "icon" as const, type: "image/png", href: "/icon.png" }];
	const { $permix } = useNuxtApp();
	const permix = $permix as Permix<PermissionsDefinition>;

	useHead({
		titleTemplate: (title) => (title ? `${title} – ${appName}` : appName),
		link: defaultIconLinks,
	});

	useSeoMeta({
		robots: "noindex, nofollow",
	});
</script>

<template>
	<PermixProvider :permix="permix">
		<UApp :toaster="{ position: 'top-right' }">
			<NuxtLoadingIndicator color="var(--ui-primary)" />
			<NuxtLayout>
				<NuxtPage />
			</NuxtLayout>
		</UApp>
	</PermixProvider>
</template>
