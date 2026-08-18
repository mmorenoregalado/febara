<script setup lang="ts">
	// Static, hardcoded mockup for marketing purposes only — not the real identification flow.
	// For the functional component, see apps/saas/modules/pokemon/components/PokemonIdentificationResult.vue.
	const PREVIEW_ADDRESS = "app.pokedexmanager.com";
	const PREVIEW_POKEMON_IMAGE_URL =
		"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png";

	const { t } = useTranslations();
</script>

<template>
	<figure
		class="shadow-olive-950/30 dark:shadow-black/70 m-0 rounded-2xl border-default/70 bg-elevated overflow-hidden border shadow-[0_24px_80px_-32px]"
	>
		<figcaption class="sr-only">{{ t("home.hero.imageAlt") }}</figcaption>
		<div aria-hidden="true" class="pointer-events-none select-none">
			<div
				class="gap-3 px-3 py-2 border-default/60 grid grid-cols-[auto_1fr_auto] items-center border-b"
			>
				<div class="gap-1.5 flex items-center">
					<span class="size-2.5 rounded-full bg-[#FF5F57]" />
					<span class="size-2.5 rounded-full bg-[#FEBC2E]" />
					<span class="size-2.5 rounded-full bg-[#28C840]" />
				</div>
				<div
					class="max-w-xs px-3 py-1 text-xs rounded-md bg-muted/70 text-highlighted/40 mx-auto w-full truncate text-center"
				>
					{{ PREVIEW_ADDRESS }}
				</div>
				<div class="w-[42px]" />
			</div>

			<div
				class="md:min-h-[28rem] gap-6 p-6 sm:p-8 bg-muted/35 flex min-h-[22rem] flex-col items-center justify-center lg:flex-row"
			>
				<div class="gap-2 flex flex-col items-center">
					<div
						class="h-56 w-40 rounded-xl border-default gap-2 bg-elevated flex flex-col items-center justify-center border-2 border-dashed"
					>
						<UIcon name="i-lucide-image" class="text-dimmed size-8" />
					</div>
					<p class="text-highlighted/45 text-xs">{{ t("home.hero.preview.uploadHint") }}</p>
				</div>

				<UIcon
					name="i-lucide-arrow-right"
					class="text-highlighted/25 hidden size-6 shrink-0 lg:block"
				/>
				<UIcon
					name="i-lucide-arrow-down"
					class="text-highlighted/25 size-6 shrink-0 lg:hidden"
				/>

				<div
					class="rounded-xl border-default/70 bg-elevated gap-3 p-5 flex w-full max-w-[15rem] flex-col items-center border text-center shadow-sm"
				>
					<img
						:src="PREVIEW_POKEMON_IMAGE_URL"
						:alt="t('home.hero.preview.pokemonName')"
						class="h-24 w-24 shrink-0 object-contain"
					/>

					<div>
						<span class="text-highlighted/40 text-xs">{{ t("home.hero.preview.pokemonId") }}</span>
						<h3 class="font-semibold text-lg text-highlighted">
							{{ t("home.hero.preview.pokemonName") }}
						</h3>
					</div>

					<div class="gap-1 flex flex-wrap justify-center">
						<UBadge color="neutral" variant="soft" size="sm">
							{{ t("home.hero.preview.type1") }}
						</UBadge>
						<UBadge color="neutral" variant="soft" size="sm">
							{{ t("home.hero.preview.type2") }}
						</UBadge>
					</div>

					<div class="gap-1.5 flex items-center">
						<span class="text-highlighted/40 text-xs"
							>{{ t("home.hero.preview.confidenceLabel") }}:</span
						>
						<UBadge color="success" variant="soft" size="sm">
							{{ t("home.hero.preview.confidenceHigh") }}
						</UBadge>
					</div>
				</div>
			</div>
		</div>
	</figure>
</template>
