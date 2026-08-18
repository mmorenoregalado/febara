import type { MaybeRefOrGetter } from "vue";

export const useCollectionMembership = (pokemonIds: MaybeRefOrGetter<number[]>) => {
	const nuxtApp = useNuxtApp();
	const { orpc } = useORPC();

	const sortedIds = computed(() => [...toValue(pokemonIds)].sort((a, b) => a - b));

	const membershipQuery = useQuery({
		queryKey: computed(() =>
			orpc.collection.containsMany.queryKey({ input: { pokemonIds: sortedIds.value } }),
		),
		queryFn: async ({ signal }) => {
			const orpcClient = nuxtApp.$orpcClient;
			return orpcClient.collection.containsMany({ pokemonIds: sortedIds.value }, { signal });
		},
		enabled: computed(() => sortedIds.value.length > 0),
	});

	return {
		inCollectionIds: computed(() => new Set(membershipQuery.data.value?.pokemonIds ?? [])),
		isLoading: computed(() => sortedIds.value.length > 0 && membershipQuery.isLoading.value),
	};
};
