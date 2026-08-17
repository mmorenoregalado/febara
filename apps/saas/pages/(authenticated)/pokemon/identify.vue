<script setup lang="ts">
	const { t } = useTranslations();

	definePageMeta({
		layout: "app",
	});

	useSeoMeta({
		title: () => t("pokemon.identify.title"),
	});
</script>

<template>
	<div class="gap-4 flex flex-col">
		<div>
			<h1 class="text-2xl font-bold">{{ t("pokemon.identify.title") }}</h1>
			<p class="text-muted">{{ t("pokemon.identify.description") }}</p>
		</div>

		<PokemonCardIdentifier />
	</div>
</template>
