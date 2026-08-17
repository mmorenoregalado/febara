import type { MaybeRefOrGetter } from "vue";

export const useCollectionItem = (pokemonId: MaybeRefOrGetter<number>) => {
	const nuxtApp = useNuxtApp();
	const { orpc } = useORPC();
	const queryClient = useQueryClient();

	const containsQuery = useQuery({
		queryKey: computed(() =>
			orpc.collection.contains.queryKey({ input: { pokemonId: toValue(pokemonId) } }),
		),
		queryFn: async ({ signal }) => {
			const orpcClient = nuxtApp.$orpcClient;
			return orpcClient.collection.contains({ pokemonId: toValue(pokemonId) }, { signal });
		},
	});

	const invalidateCollection = async () => {
		await queryClient.invalidateQueries({ queryKey: orpc.collection.list.key() });
		await queryClient.invalidateQueries({ queryKey: orpc.collection.contains.key() });
	};

	const addMutation = useMutation({
		...orpc.collection.add.mutationOptions(),
		onSuccess: invalidateCollection,
	});

	const removeMutation = useMutation({
		...orpc.collection.remove.mutationOptions(),
		onSuccess: invalidateCollection,
	});

	return {
		inCollection: computed(() => containsQuery.data.value?.exists ?? false),
		isLoading: containsQuery.isLoading,
		add: () => addMutation.mutateAsync({ pokemonId: toValue(pokemonId) }),
		remove: () => removeMutation.mutateAsync({ pokemonId: toValue(pokemonId) }),
		isAdding: addMutation.isPending,
		isRemoving: removeMutation.isPending,
	};
};
