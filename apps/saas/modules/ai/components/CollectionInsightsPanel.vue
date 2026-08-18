<script lang="ts" setup>
	const { t } = useTranslations();

	const { state, result, error, isAnalyzing, analyze, reset } = useCollectionInsights();
</script>

<template>
	<div class="mt-8 gap-4 flex flex-col">
		<UButton
			icon="i-lucide-sparkles"
			variant="soft"
			class="self-start"
			:label="t('ai.collectionInsights.actions.analyze')"
			:loading="isAnalyzing"
			:disabled="isAnalyzing"
			@click="analyze"
		/>

		<div v-if="state === 'analyzing'" class="gap-3 py-6 flex flex-col items-center">
			<USkeleton class="h-24 w-full" />
			<p class="text-muted">{{ t("ai.collectionInsights.actions.analyzing") }}</p>
		</div>

		<CollectionInsightsResult
			v-else-if="state === 'success' || state === 'error'"
			:result="result"
			:error-key="error"
			@retry="reset"
		/>
	</div>
</template>
