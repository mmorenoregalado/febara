<script setup lang="ts">
	const appName = useRuntimeConfig().public.appName;

	useHead({
		titleTemplate: (title) => (title ? `${title} – ${appName}` : appName),
		link: [{ rel: "icon", type: "image/png", href: "/icon.png" }],
	});
</script>

<template>
	<UApp :toaster="{ position: 'top-right' }">
		<NuxtLoadingIndicator color="var(--ui-primary)" />
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
	</UApp>
</template>
