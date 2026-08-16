<script setup lang="ts">
	const { t } = useTranslations();

	useSeoMeta({
		title: t("notFound.title"),
	});
</script>

<template>
	<div class="flex h-screen flex-col items-center justify-center">
		<h1 class="text-5xl font-bold">404</h1>
		<p class="mt-2 text-2xl">Page not found</p>

		<UButton to="/" class="mt-4">
			<UIcon name="i-lucide-undo" class="mr-2 size-4" /> Go to homepage
		</UButton>
	</div>
</template>
