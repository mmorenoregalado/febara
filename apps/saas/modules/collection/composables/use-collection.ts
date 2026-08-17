export const useCollection = () => {
	const { orpc } = useORPC();
	const queryClient = useQueryClient();

	const collectionQuery = useQuery(orpc.collection.list.queryOptions({ input: {} }));

	const invalidateCollection = async () => {
		await queryClient.invalidateQueries({ queryKey: orpc.collection.list.key() });
		await queryClient.invalidateQueries({ queryKey: orpc.collection.contains.key() });
	};

	const removeMutation = useMutation({
		...orpc.collection.remove.mutationOptions(),
		onSuccess: invalidateCollection,
	});

	return {
		collection: computed(() => collectionQuery.data.value ?? []),
		isLoading: collectionQuery.isLoading,
		isError: collectionQuery.isError,
		error: collectionQuery.error,
		remove: removeMutation.mutateAsync,
		isRemoving: removeMutation.isPending,
	};
};
