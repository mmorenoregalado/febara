<script lang="ts" setup>
	import type { ApiRouterOutputs } from "@repo/api/orpc/router";

	type InsightsResult = ApiRouterOutputs["ai"]["collectionInsights"];

	defineProps<{
		result: InsightsResult | null;
		errorKey: string | null;
	}>();

	defineEmits<{
		retry: [];
	}>();

	const { t } = useTranslations();
</script>

<template>
	<div class="gap-4 flex flex-col">
		<template v-if="errorKey">
			<UAlert color="error" :description="t(errorKey)" />
			<UButton
				icon="i-lucide-rotate-ccw"
				variant="soft"
				class="self-start"
				:label="t('ai.collectionInsights.actions.retry')"
				@click="$emit('retry')"
			/>
		</template>

		<template v-else-if="result && !result.hasCollection">
			<div class="gap-3 py-10 flex flex-col items-center text-center">
				<UIcon name="i-lucide-sparkles" class="text-dimmed h-10 w-10" />
				<h2 class="text-lg font-semibold">{{ t("ai.collectionInsights.empty.title") }}</h2>
				<p class="text-muted max-w-sm">{{ t("ai.collectionInsights.empty.description") }}</p>
			</div>
		</template>

		<template v-else-if="result && result.hasCollection">
			<div class="rounded-md border-default bg-default gap-4 p-6 flex flex-col border">
				<p>{{ result.summary }}</p>

				<div v-if="result.typeDistribution.length > 0">
					<h3 class="text-muted mb-2 text-sm font-semibold">
						{{ t("ai.collectionInsights.result.typeDistributionTitle") }}
					</h3>
					<div class="gap-1 flex flex-wrap">
						<UBadge
							v-for="entry in result.typeDistribution"
							:key="entry.type"
							color="neutral"
							variant="soft"
							class="capitalize"
						>
							{{ entry.type }} ({{ entry.count }})
						</UBadge>
					</div>
				</div>

				<div v-if="result.strengths.length > 0">
					<h3 class="text-muted mb-2 text-sm font-semibold">
						{{ t("ai.collectionInsights.result.strengthsTitle") }}
					</h3>
					<ul class="list-inside list-disc">
						<li v-for="(strength, index) in result.strengths" :key="index">{{ strength }}</li>
					</ul>
				</div>

				<div v-if="result.gaps.length > 0">
					<h3 class="text-muted mb-2 text-sm font-semibold">
						{{ t("ai.collectionInsights.result.gapsTitle") }}
					</h3>
					<ul class="gap-1 flex flex-col">
						<li v-for="gap in result.gaps" :key="gap.type">
							<UBadge color="warning" variant="soft" class="capitalize">{{ gap.type }}</UBadge>
							<span class="text-muted ml-2 text-sm">{{ gap.reason }}</span>
						</li>
					</ul>
				</div>

				<div v-if="result.recommendations.length > 0">
					<h3 class="text-muted mb-2 text-sm font-semibold">
						{{ t("ai.collectionInsights.result.recommendationsTitle") }}
					</h3>
					<ul class="gap-1 flex flex-col">
						<li v-for="rec in result.recommendations" :key="rec.pokemonName">
							<span class="font-medium capitalize">{{ rec.pokemonName }}</span>
							<span class="text-muted ml-2 text-sm">{{ rec.reason }}</span>
						</li>
					</ul>
				</div>

				<UButton
					icon="i-lucide-rotate-ccw"
					variant="ghost"
					color="neutral"
					class="self-start"
					:label="t('ai.collectionInsights.actions.retry')"
					@click="$emit('retry')"
				/>
			</div>
		</template>
	</div>
</template>
