<script lang="ts" setup>
	import type { ApiRouterOutputs } from "@repo/api/orpc/router";

	type CollectionEntry = ApiRouterOutputs["collection"]["list"][number];

	defineProps<{
		collection: CollectionEntry[];
		pendingPokemonId?: number | null;
	}>();

	defineEmits<{
		remove: [pokemonId: number];
	}>();
</script>

<template>
	<div class="gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 grid grid-cols-2">
		<CollectionCard
			v-for="p in collection"
			:key="p.id"
			:pokemon="p"
			:pending="pendingPokemonId === p.id"
			@remove="$emit('remove', $event)"
		/>
	</div>
</template>
