<script setup lang="ts">
	const { t } = useTranslations();

	useSeoMeta({
		title: computed(() => t("notFound.title")),
	});
</script>

<template>
	<div class="px-6 flex min-h-[60vh] flex-col items-center justify-center text-center">
		<p class="font-medium text-sm tracking-wide text-highlighted/45">{{ t("notFound.code") }}</p>
		<h1 class="mt-2 font-medium text-3xl md:text-4xl tracking-tight text-balance">
			{{ t("notFound.title") }}
		</h1>

		<UButton to="/" class="mt-6" variant="secondary">
			<UIcon name="i-lucide-arrow-left" class="mr-2 size-4" />
			{{ t("notFound.goToHomepage") }}
		</UButton>
	</div>
</template>
