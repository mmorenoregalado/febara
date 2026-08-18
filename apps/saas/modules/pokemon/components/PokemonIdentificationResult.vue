<script lang="ts" setup>
	import type { ApiRouterOutputs } from "@repo/api/orpc/router";

	type IdentificationResult = ApiRouterOutputs["ai"]["identifyPokemonCard"];

	defineProps<{
		result: IdentificationResult | null;
		errorKey: string | null;
		canRetryWithSameImage: boolean;
	}>();

	defineEmits<{
		"retry-same-image": [];
		"choose-new-image": [];
	}>();

	const { t } = useTranslations();

	const confidenceColor: Record<"high" | "medium" | "low", "success" | "warning" | "error"> = {
		high: "success",
		medium: "warning",
		low: "error",
	};
</script>

<template>
	<div class="gap-4 flex flex-col">
		<template v-if="errorKey">
			<UAlert color="error" aria-live="polite" :description="t(errorKey)" />
			<div class="gap-2 flex flex-wrap">
				<UButton
					v-if="canRetryWithSameImage"
					icon="i-lucide-rotate-ccw"
					:label="t('pokemon.identify.actions.retrySameImage')"
					@click="$emit('retry-same-image')"
				/>
				<UButton
					icon="i-lucide-image"
					:variant="canRetryWithSameImage ? 'ghost' : 'soft'"
					:color="canRetryWithSameImage ? 'neutral' : 'primary'"
					:label="t('pokemon.identify.actions.retry')"
					@click="$emit('choose-new-image')"
				/>
			</div>
		</template>

		<template v-else-if="result && !result.identified">
			<div class="gap-3 py-10 flex flex-col items-center text-center">
				<UIcon name="i-lucide-search-x" class="text-dimmed h-10 w-10" />
				<h2 class="text-lg font-semibold">{{ t("pokemon.identify.empty.title") }}</h2>
				<p class="text-muted max-w-sm">{{ t("pokemon.identify.empty.description") }}</p>
				<UButton
					icon="i-lucide-rotate-ccw"
					:label="t('pokemon.identify.actions.retry')"
					@click="$emit('choose-new-image')"
				/>
			</div>
		</template>

		<template v-else-if="result && result.identified">
			<div
				class="rounded-md border-default bg-default gap-4 p-6 flex flex-col items-center border text-center"
			>
				<img
					v-if="result.pokemon.imageUrl"
					:src="result.pokemon.imageUrl"
					:alt="result.pokemon.name"
					class="h-40 w-40 shrink-0 object-contain"
				/>
				<div v-else class="h-40 w-40 flex shrink-0 items-center justify-center">
					<UIcon name="i-lucide-image-off" class="text-dimmed h-12 w-12" />
				</div>

				<div>
					<span class="text-muted">#{{ String(result.pokemon.id).padStart(4, "0") }}</span>
					<h2 class="text-2xl font-bold capitalize">{{ result.pokemon.name }}</h2>
				</div>

				<div class="gap-1 flex flex-wrap justify-center">
					<UBadge
						v-for="type in result.pokemon.types"
						:key="type"
						color="neutral"
						variant="soft"
						class="capitalize"
					>
						{{ type }}
					</UBadge>
				</div>

				<div class="gap-2 flex items-center">
					<span class="text-muted text-sm"
						>{{ t("pokemon.identify.result.confidence.label") }}:</span
					>
					<UBadge :color="confidenceColor[result.confidence]" variant="soft">
						{{ t(`pokemon.identify.result.confidence.${result.confidence}`) }}
					</UBadge>
				</div>

				<UAlert
					v-if="result.confidence === 'low'"
					color="warning"
					variant="soft"
					icon="i-lucide-triangle-alert"
					:description="t('pokemon.identify.result.lowConfidenceWarning')"
				/>

				<div class="gap-2 flex flex-wrap justify-center">
					<UButton
						icon="i-lucide-external-link"
						variant="outline"
						color="neutral"
						:to="`/pokemon/${result.pokemon.name}`"
						:label="t('pokemon.identify.actions.viewDetail')"
					/>
					<CollectionToggleButton :pokemon-id="result.pokemon.id" />
				</div>

				<UButton
					icon="i-lucide-rotate-ccw"
					variant="ghost"
					color="neutral"
					:label="t('pokemon.identify.actions.retry')"
					@click="$emit('choose-new-image')"
				/>
			</div>
		</template>
	</div>
</template>
