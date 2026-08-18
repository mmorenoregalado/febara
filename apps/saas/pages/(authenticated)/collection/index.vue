<script setup lang="ts">
	const { t } = useTranslations();

	const chatOpen = ref(false);

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
		>
			<template #links>
				<UButton
					icon="i-lucide-sparkles"
					variant="secondary"
					:aria-label="t('ai.collectionChat.triggerAriaLabel')"
					@click="chatOpen = true"
				>
					{{ t("ai.collectionChat.triggerLabel") }}
				</UButton>
			</template>
		</UPageHeader>

		<CollectionList />
		<CollectionChatDrawer v-model:open="chatOpen" />
	</div>
</template>
