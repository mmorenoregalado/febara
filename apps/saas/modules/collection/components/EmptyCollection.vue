<script lang="ts" setup>
	const { t } = useTranslations();
</script>

<template>
	<div class="gap-3 py-16 flex flex-col items-center text-center">
		<UIcon name="i-lucide-package-open" class="text-dimmed h-10 w-10" />
		<h2 class="text-lg font-semibold">{{ t("collection.empty.title") }}</h2>
		<p class="text-muted max-w-sm">{{ t("collection.empty.description") }}</p>
		<UButton to="/pokemon" icon="i-lucide-search" :label="t('collection.empty.cta')" />
	</div>
</template>
