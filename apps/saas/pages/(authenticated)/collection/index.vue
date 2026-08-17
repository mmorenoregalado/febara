<script setup lang="ts">
	const { t } = useTranslations();

	definePageMeta({
		layout: "app",
	});

	useSeoMeta({
		title: () => t("collection.title"),
		description: () => t("collection.description"),
	});
</script>

<template>
	<div>
		<UPageHeader
			:title="t('collection.title')"
			:description="t('collection.description')"
			class="mb-8 pt-0"
		/>

		<CollectionList />
	</div>
</template>
