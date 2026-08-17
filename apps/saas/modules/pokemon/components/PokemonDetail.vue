<script lang="ts" setup>
	import type { ApiRouterOutputs } from "@repo/api/orpc/router";

	type PokemonDetail = ApiRouterOutputs["pokemon"]["get"];

	defineProps<{
		pokemon: PokemonDetail;
	}>();

	const { t } = useTranslations();
</script>

<template>
	<div
		class="rounded-md border-default bg-default gap-8 p-6 md:grid-cols-2 grid grid-cols-1 border"
	>
		<div class="gap-4 flex flex-col items-center text-center">
			<img
				v-if="pokemon.imageUrl"
				:src="pokemon.imageUrl"
				:alt="pokemon.name"
				class="h-48 w-48 shrink-0 object-contain"
			/>
			<div v-else class="h-48 w-48 flex shrink-0 items-center justify-center">
				<UIcon name="i-lucide-image-off" class="text-dimmed h-12 w-12" />
			</div>

			<div>
				<span class="text-muted">#{{ String(pokemon.id).padStart(4, "0") }}</span>
				<h1 class="text-2xl font-bold capitalize">{{ pokemon.name }}</h1>
			</div>

			<div class="gap-1 flex flex-wrap justify-center">
				<UBadge
					v-for="type in pokemon.types"
					:key="type"
					color="neutral"
					variant="soft"
					class="capitalize"
				>
					{{ type }}
				</UBadge>
			</div>

			<CollectionToggleButton :pokemon-id="pokemon.id" />
		</div>

		<div class="gap-6 flex flex-col">
			<div>
				<h2 class="text-lg font-semibold mb-2">{{ t("pokemon.detail.info") }}</h2>
				<div class="gap-4 grid grid-cols-2">
					<div>
						<span class="text-muted text-sm block">{{ t("pokemon.detail.height") }}</span>
						<span class="font-medium">{{ pokemon.heightM }} m</span>
					</div>
					<div>
						<span class="text-muted text-sm block">{{ t("pokemon.detail.weight") }}</span>
						<span class="font-medium">{{ pokemon.weightKg }} kg</span>
					</div>
					<div class="col-span-2">
						<span class="text-muted text-sm block">{{ t("pokemon.detail.abilities") }}</span>
						<div class="gap-1 mt-1 flex flex-wrap">
							<UBadge
								v-for="ability in pokemon.abilities"
								:key="ability"
								color="neutral"
								variant="outline"
								size="sm"
								class="capitalize"
							>
								{{ ability }}
							</UBadge>
						</div>
					</div>
				</div>
			</div>

			<div>
				<h2 class="text-lg font-semibold mb-2">{{ t("pokemon.detail.stats.title") }}</h2>
				<div class="gap-2 flex flex-col">
					<PokemonStatBar :label="t('pokemon.detail.stats.hp')" :value="pokemon.stats.hp" />
					<PokemonStatBar :label="t('pokemon.detail.stats.attack')" :value="pokemon.stats.attack" />
					<PokemonStatBar
						:label="t('pokemon.detail.stats.defense')"
						:value="pokemon.stats.defense"
					/>
					<PokemonStatBar
						:label="t('pokemon.detail.stats.specialAttack')"
						:value="pokemon.stats.specialAttack"
					/>
					<PokemonStatBar
						:label="t('pokemon.detail.stats.specialDefense')"
						:value="pokemon.stats.specialDefense"
					/>
					<PokemonStatBar :label="t('pokemon.detail.stats.speed')" :value="pokemon.stats.speed" />
				</div>
			</div>
		</div>
	</div>
</template>
