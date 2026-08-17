<script setup lang="ts">
	import { ORPCError } from "@orpc/client";

	const route = useRoute();
	const nuxtApp = useNuxtApp();
	const { orpc } = useORPC();
	const { t } = useTranslations();

	definePageMeta({
		layout: "app",
	});

	const idOrName = computed(() => String(route.params.idOrName));

	const { data, isError, isLoading, error } = useQuery({
		queryKey: computed(() => orpc.pokemon.get.queryKey({ input: { idOrName: idOrName.value } })),
		queryFn: async ({ signal }) => {
			const orpcClient = nuxtApp.$orpcClient;
			return orpcClient.pokemon.get({ idOrName: idOrName.value }, { signal });
		},
	});

	const isNotFound = computed(
		() => error.value instanceof ORPCError && error.value.code === "NOT_FOUND",
	);

	useSeoMeta({
		title: () =>
			data.value
				? `#${String(data.value.id).padStart(4, "0")} — ${data.value.name}`
				: t("pokemon.title"),
	});
</script>

<template>
	<div class="gap-4 flex flex-col">
		<UButton
			to="/pokemon"
			icon="i-lucide-arrow-left"
			variant="ghost"
			color="neutral"
			class="self-start"
			:label="t('pokemon.detail.back')"
		/>

		<div v-if="isNotFound" class="gap-3 py-16 flex flex-col items-center text-center">
			<UIcon name="i-lucide-search-x" class="text-dimmed h-10 w-10" />
			<h1 class="text-xl font-semibold">{{ t("pokemon.detail.notFound") }}</h1>
			<p class="text-muted max-w-sm">{{ t("pokemon.detail.notFoundDescription") }}</p>
			<UButton to="/pokemon" :label="t('pokemon.detail.back')" />
		</div>

		<UAlert
			v-else-if="isError"
			color="error"
			:title="t('pokemon.detail.error.title')"
			:description="t('pokemon.detail.error.description')"
		/>

		<USkeleton v-else-if="isLoading" class="h-56 w-full" />

		<PokemonDetail v-else-if="data" :pokemon="data" />
	</div>
</template>
