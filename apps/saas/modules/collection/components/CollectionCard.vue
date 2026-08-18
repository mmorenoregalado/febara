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
	<NuxtLink
		:to="`/pokemon/${pokemon.name}`"
		class="group rounded-xl border-default bg-default p-5 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg gap-3 relative flex flex-col items-center border transition-all"
	>
		<span
			class="left-3 top-3 bg-default/80 backdrop-blur px-2 py-0.5 text-xs font-mono text-muted absolute z-10 rounded-full"
		>
			#{{ String(pokemon.id).padStart(4, "0") }}
		</span>

		<UButton
			variant="soft"
			color="error"
			size="xs"
			square
			icon="i-lucide-trash-2"
			:loading="pending"
			:aria-label="t('collection.card.remove')"
			class="right-3 top-3 sm:opacity-0 sm:group-hover:opacity-100 absolute z-10 rounded-full opacity-100 transition-opacity transition-transform hover:scale-105 focus-visible:opacity-100"
			@click.stop.prevent="openConfirmation"
		/>

		<div class="bg-muted/50 size-28 rounded-2xl p-3 flex items-center justify-center">
			<img
				v-if="pokemon.imageUrl"
				:src="pokemon.imageUrl"
				:alt="pokemon.name"
				loading="lazy"
				class="size-full object-contain transition-transform duration-500 group-hover:scale-110"
			/>
			<UIcon v-else name="i-lucide-image-off" class="text-dimmed h-8 w-8" />
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
	</NuxtLink>
</template>
