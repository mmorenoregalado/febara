<script lang="ts" setup>
	import type { ApiRouterOutputs } from "@repo/api/orpc/router";

	type PokemonSummary = ApiRouterOutputs["pokemon"]["list"]["pokemon"][number];

	const props = withDefaults(
		defineProps<{
			pokemon: PokemonSummary;
			inCollection: boolean;
			inCollectionLoading?: boolean;
		}>(),
		{ inCollectionLoading: false },
	);

	const { t } = useTranslations();
	const toast = useToast();
	const { user } = useSession();

	const { add, remove, isAdding, isRemoving } = useCollectionMutations(() => props.pokemon.id);

	const onAdd = async () => {
		try {
			await add();
			toast.add({ color: "success", title: t("collection.notifications.added") });
		} catch {
			toast.add({ color: "error", title: t("collection.notifications.addError") });
		}
	};

	const onRemove = async () => {
		try {
			await remove();
			toast.add({ color: "success", title: t("collection.notifications.removed") });
		} catch {
			toast.add({ color: "error", title: t("collection.notifications.removeError") });
		}
	};
</script>

<template>
	<NuxtLink
		:to="`/pokemon/${pokemon.name}`"
		class="rounded-md border-default bg-default gap-2 p-4 hover:border-primary flex flex-col items-center border transition-colors"
	>
		<div class="relative">
			<img
				v-if="pokemon.imageUrl"
				:src="pokemon.imageUrl"
				:alt="pokemon.name"
				loading="lazy"
				class="h-24 w-24 object-contain"
			/>
			<div v-else class="h-24 w-24 flex items-center justify-center">
				<UIcon name="i-lucide-image-off" class="text-dimmed h-8 w-8" />
			</div>

			<UButton
				v-if="user && !inCollectionLoading"
				size="xs"
				:color="inCollection ? 'success' : 'primary'"
				:variant="inCollection ? 'soft' : 'solid'"
				square
				class="right-0 bottom-0 shadow absolute z-10 rounded-full transition-transform hover:scale-105"
				:loading="isAdding || isRemoving"
				:aria-label="inCollection ? t('collection.card.inCollection') : t('collection.card.add')"
				@click.stop.prevent="inCollection ? onRemove() : onAdd()"
			>
				<UIcon :name="inCollection ? 'i-lucide-check' : 'i-lucide-plus'" class="size-3.5" />
			</UButton>
		</div>

		<span class="font-medium capitalize">{{ pokemon.name }}</span>

		<div class="gap-1 flex flex-wrap justify-center">
			<UBadge
				v-for="type in pokemon.types"
				:key="type"
				color="neutral"
				variant="soft"
				size="sm"
				class="capitalize"
			>
				{{ type }}
			</UBadge>
			<UBadge v-if="pokemon.types.length === 0" color="neutral" variant="soft" size="sm">
				{{ t("pokemon.card.unknownType") }}
			</UBadge>
		</div>
	</NuxtLink>
</template>
