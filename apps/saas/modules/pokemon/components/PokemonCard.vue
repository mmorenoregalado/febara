<script lang="ts" setup>
	import type { ApiRouterOutputs } from "@repo/api/orpc/router";

	type PokemonSummary = ApiRouterOutputs["pokemon"]["list"]["pokemon"][number];

	defineProps<{
		pokemon: PokemonSummary;
	}>();

	const { t } = useTranslations();
</script>

<template>
	<NuxtLink
		:to="`/pokemon/${pokemon.name}`"
		class="rounded-md border-default bg-default gap-2 p-4 hover:border-primary flex flex-col items-center border transition-colors"
	>
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
