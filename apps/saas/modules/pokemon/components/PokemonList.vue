<script lang="ts" setup>
	import { useDebounceFn } from "@vueuse/core";

	const nuxtApp = useNuxtApp();
	const { orpc } = useORPC();
	const { t } = useTranslations();
	const itemsPerPage = ref(20);

	const qQuery = useRouteQueryParam("q");
	const pageQuery = useRouteQueryParam("page", "1");

	const searchTerm = ref(qQuery.value);
	const debouncedForApi = ref(qQuery.value.trim());

	const readPageFromRoute = () => {
		const p = Number.parseInt(pageQuery.value, 10);
		if (!Number.isFinite(p) || p < 1) {
			return 1;
		}
		return p;
	};

	const currentPage = ref(readPageFromRoute());
	let isSyncingPageFromRoute = false;

	watch(
		pageQuery,
		() => {
			const next = readPageFromRoute();
			if (currentPage.value === next) {
				return;
			}
			isSyncingPageFromRoute = true;
			currentPage.value = next;
			void nextTick(() => {
				isSyncingPageFromRoute = false;
			});
		},
		{ immediate: true },
	);

	watch(currentPage, (p) => {
		if (isSyncingPageFromRoute) {
			return;
		}
		if (p === readPageFromRoute()) {
			return;
		}
		const q = debouncedForApi.value;
		if (!qQuery.value && q) {
			qQuery.value = q;
		}
		pageQuery.value = p > 1 ? String(p) : "1";
	});

	const runDebounced = useDebounceFn((v: string) => {
		debouncedForApi.value = v.trim();
	}, 500);

	watch(searchTerm, (v) => {
		void runDebounced(v);
	});

	watch(debouncedForApi, (q) => {
		if (q === qQuery.value.trim()) {
			return;
		}
		isSyncingPageFromRoute = true;
		currentPage.value = 1;
		pageQuery.value = "1";
		qQuery.value = q;
		void nextTick(() => {
			isSyncingPageFromRoute = false;
		});
	});

	watch(qQuery, (q) => {
		if (q !== searchTerm.value) {
			searchTerm.value = q;
		}
		debouncedForApi.value = q.trim();
	});

	// For each request, read the latest list args (route drives page, debounced field drives q).
	const listInput = computed(() => ({
		limit: itemsPerPage.value,
		offset: (currentPage.value - 1) * itemsPerPage.value,
		query: debouncedForApi.value || undefined,
	}));

	const { data, isError, isLoading, error } = useQuery({
		queryKey: computed(() => orpc.pokemon.list.queryKey({ input: toValue(listInput) })),
		queryFn: async ({ signal }) => {
			const orpcClient = nuxtApp.$orpcClient;
			return orpcClient.pokemon.list(toValue(listInput), { signal });
		},
	});

	const pokemon = computed(() => data.value?.pokemon ?? []);
	const skeletonIndices = computed(() => Array.from({ length: itemsPerPage.value }, (_, i) => i));

	const pokemonIds = computed(() => pokemon.value.map((p) => p.id));
	const { inCollectionIds, isLoading: isCollectionLoading } = useCollectionMembership(pokemonIds);
</script>

<template>
	<div class="gap-4 flex flex-col">
		<UInput
			type="search"
			:placeholder="t('pokemon.search')"
			v-model="searchTerm"
			icon="i-lucide-search"
		/>

		<UAlert
			v-if="isError"
			color="error"
			:title="t('pokemon.error.title')"
			:description="error?.message"
		/>

		<div
			v-else-if="isLoading"
			class="gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 grid grid-cols-2"
			:aria-label="t('pokemon.loading')"
		>
			<USkeleton v-for="i in skeletonIndices" :key="i" class="h-40 w-full" />
		</div>

		<div v-else-if="pokemon.length === 0" class="text-muted py-12 text-center">
			{{ t("pokemon.empty") }}
		</div>

		<div v-else class="gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 grid grid-cols-2">
			<PokemonCard
				v-for="p in pokemon"
				:key="p.id"
				:pokemon="p"
				:in-collection="inCollectionIds.has(p.id)"
				:in-collection-loading="isCollectionLoading"
			/>
		</div>

		<div class="flex justify-center">
			<UPagination
				v-model:page="currentPage"
				:total="data?.total ?? 0"
				:items-per-page="itemsPerPage"
				:sibling-count="1"
				:show-edges="true"
			/>
		</div>
	</div>
</template>
