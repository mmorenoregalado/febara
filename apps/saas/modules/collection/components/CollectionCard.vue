<script lang="ts" setup>
	import type { ApiRouterOutputs } from "@repo/api/orpc/router";

	type CollectionEntry = ApiRouterOutputs["collection"]["list"][number];

	defineProps<{
		pokemon: CollectionEntry;
		pending?: boolean;
	}>();

	const emit = defineEmits<{
		remove: [pokemonId: number];
	}>();

	const { t } = useTranslations();
	const showConfirmation = ref(false);

	const openConfirmation = () => {
		showConfirmation.value = true;
	};

	const closeConfirmation = () => {
		showConfirmation.value = false;
	};

	const confirmRemove = (pokemonId: number) => {
		showConfirmation.value = false;
		emit("remove", pokemonId);
	};
</script>

<template>
	<div class="rounded-md border-default bg-default gap-3 p-4 flex flex-col items-center border">
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

		<span class="font-medium capitalize">{{ pokemon.name }}</span>
		<span class="text-muted text-sm">#{{ String(pokemon.id).padStart(4, "0") }}</span>

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
		</div>

		<div class="gap-2 mt-2 flex w-full">
			<UButton
				:to="`/pokemon/${pokemon.name}`"
				variant="soft"
				color="neutral"
				size="sm"
				class="flex-1 justify-center"
				:label="t('collection.card.viewDetail')"
			/>
			<UButton
				variant="soft"
				color="error"
				size="sm"
				icon="i-lucide-trash-2"
				:loading="pending"
				:aria-label="t('collection.card.remove')"
				@click="openConfirmation"
			/>
		</div>

		<UModal
			v-model:open="showConfirmation"
			:title="t('collection.confirmRemove.title')"
			:description="t('collection.confirmRemove.description')"
		>
			<template #footer>
				<UButton
					variant="secondary"
					:label="t('common.confirmation.cancel')"
					@click="closeConfirmation"
				/>
				<UButton
					variant="solid"
					color="error"
					:label="t('collection.card.remove')"
					@click="confirmRemove(pokemon.id)"
				/>
			</template>
		</UModal>
	</div>
</template>
