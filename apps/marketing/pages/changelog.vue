<script setup lang="ts">
	const { t } = useTranslations();

	useSeoMeta({
		title: computed(() => t("changelog.title")),
	});
</script>

<template>
	<div class="py-20 md:py-24 lg:py-28 lg:pb-40">
		<div class="container">
			<SectionHeader
				title-as="h1"
				:eyebrow="t('changelog.badge')"
				:title="t('changelog.title')"
				:description="t('changelog.description')"
			/>

			<ChangelogSection />
		</div>
	</div>
</template>
