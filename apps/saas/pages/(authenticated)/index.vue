<script setup lang="ts">
	const { t } = useTranslations();

	definePageMeta({
		layout: "app",
	});

	useSeoMeta({
		title: () => t("pokemon.title"),
		description: () => t("pokemon.description"),
	});
</script>

<template>
	<div>
		<UPageHeader
			:title="t('pokemon.title')"
			:description="t('pokemon.description')"
			class="mb-8 pt-0"
		/>

		<PokemonList />
	</div>
</template>
