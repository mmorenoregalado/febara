<script setup lang="ts">
	const { t } = useTranslations();

	useSeoMeta({
		title: computed(() => t("contact.title")),
	});
</script>

<template>
	<div class="py-20 md:py-24 lg:py-28 lg:pb-40">
		<div class="container">
			<div
				class="gap-14 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-20 lg:items-start grid w-full grid-cols-1"
			>
				<SectionHeader
					title-as="h1"
					class="mb-0 lg:mb-0"
					:eyebrow="t('contact.badge')"
					:title="t('contact.title')"
					:description="t('contact.description')"
				/>

				<ContactForm />
			</div>
		</div>
	</div>
</template>
