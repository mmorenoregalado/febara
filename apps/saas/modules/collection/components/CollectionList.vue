<script lang="ts" setup>
	const { t } = useTranslations();
	const toast = useToast();
	const { collection, isLoading, isError, remove, isRemoving } = useCollection();

	const pendingPokemonId = ref<number | null>(null);
	const skeletonIndices = Array.from({ length: 10 }, (_, i) => i);

	const onRemove = async (pokemonId: number) => {
		pendingPokemonId.value = pokemonId;
		try {
			await remove({ pokemonId });
			toast.add({
				color: "success",
				title: t("collection.notifications.removed"),
			});
		} catch {
			toast.add({
				color: "error",
				title: t("collection.notifications.removeError"),
			});
		} finally {
			pendingPokemonId.value = null;
		}
	};
</script>

<template>
	<div class="gap-4 flex flex-col">
		<UAlert
			v-if="isError"
			color="error"
			:title="t('collection.error.title')"
			:description="t('collection.error.description')"
		/>

		<div
			v-else-if="isLoading"
			class="gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 grid grid-cols-2"
			:aria-label="t('collection.loading')"
		>
			<USkeleton v-for="i in skeletonIndices" :key="i" class="h-40 w-full" />
		</div>

		<EmptyCollection v-else-if="collection.length === 0" />

		<CollectionGrid
			v-else
			:collection="collection"
			:pending-pokemon-id="isRemoving ? pendingPokemonId : null"
			@remove="onRemove"
		/>
	</div>
</template>
