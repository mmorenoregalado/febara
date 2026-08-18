<script lang="ts" setup>
	import type { ApiRouterOutputs } from "@repo/api/orpc/router";

	const { t } = useTranslations();
	const { analysisState, analysisResult, analysisErrorKey, ensureInitialAnalysis } =
		useCollectionChat();

	const { collection, isLoading: isCollectionLoading } = useCollection();
	const hasCollection = computed(() => !isCollectionLoading.value && collection.value.length > 0);

	const isAnalyzing = computed(() => analysisState.value === "loading");
	const isExpanded = ref(true);

	const TYPE_COLORS: Record<string, string> = {
		normal: "bg-gray-400 dark:bg-gray-500",
		fire: "bg-red-500",
		water: "bg-blue-500",
		electric: "bg-yellow-400",
		grass: "bg-green-500",
		ice: "bg-cyan-300",
		fighting: "bg-orange-600",
		poison: "bg-purple-500",
		ground: "bg-yellow-600",
		flying: "bg-indigo-300",
		psychic: "bg-pink-500",
		bug: "bg-lime-500",
		rock: "bg-yellow-700",
		ghost: "bg-purple-700",
		dragon: "bg-indigo-600",
		dark: "bg-gray-800 dark:bg-gray-700",
		steel: "bg-gray-500",
		fairy: "bg-pink-300",
	};

	function getTypeBgColorClass(type: string) {
		return TYPE_COLORS[type.toLowerCase()] || "bg-primary";
	}
</script>

<template>
	<div v-if="hasCollection" class="mb-8 w-full">
		<!-- Idle State -->
		<div
			v-if="analysisState === 'idle'"
			class="rounded-xl border-default bg-muted p-8 hover:border-primary/50 flex flex-col items-center justify-center border text-center transition-all"
		>
			<UIcon name="i-lucide-bar-chart-2" class="text-dimmed mb-4 size-10" />
			<h3 class="mb-2 text-lg font-semibold">{{ t("ai.collectionInsights.actions.analyze") }}</h3>
			<p class="text-muted mb-6 max-w-md text-sm">
				{{ t("ai.collectionInsights.description") }}
			</p>
			<UButton icon="i-lucide-sparkles" size="lg" @click="ensureInitialAnalysis()">
				{{ t("ai.collectionInsights.actions.analyze") }}
			</UButton>
		</div>

		<!-- Loading State -->
		<div
			v-else-if="isAnalyzing"
			class="rounded-xl border-primary/20 bg-primary/5 p-12 flex flex-col items-center justify-center border text-center transition-all"
		>
			<div class="mb-6 relative flex items-center justify-center">
				<div class="inset-0 animate-ping bg-primary/20 absolute rounded-full"></div>
				<UIcon name="i-lucide-scan" class="size-12 animate-pulse text-primary" />
			</div>
			<h3 class="text-primary text-lg font-medium">
				{{ t("ai.collectionInsights.actions.analyzing") }}
			</h3>
			<p class="text-muted mt-2 text-sm">{{ t("ai.collectionInsights.actions.scanning") }}</p>
		</div>

		<!-- Error State -->
		<UAlert
			v-else-if="analysisState === 'error'"
			color="error"
			variant="soft"
			:title="t('ai.collectionInsights.errors.generic')"
			:description="t(analysisErrorKey || 'ai.collectionInsights.errors.generic')"
			:actions="[
				{
					label: t('ai.collectionInsights.actions.retry'),
					onClick: () => ensureInitialAnalysis(true),
				},
			]"
			class="mb-8"
		/>

		<!-- Empty State (No Collection) -->
		<!-- We don't render anything, the normal empty state on the page will handle it -->

		<!-- Done State -->
		<div v-else-if="analysisState === 'done' && analysisResult" class="gap-4 flex flex-col">
			<!-- Header -->
			<div class="mb-2 flex items-center justify-between">
				<h2 class="text-xl font-semibold gap-2 flex items-center">
					<UIcon name="i-lucide-bar-chart-2" class="text-primary" />
					{{ t("ai.collectionInsights.title") }}
				</h2>
				<div class="gap-2 flex">
					<UButton
						icon="i-lucide-refresh-cw"
						variant="ghost"
						color="neutral"
						size="sm"
						:label="t('ai.collectionInsights.actions.refresh')"
						@click="ensureInitialAnalysis(true)"
					/>
					<UButton
						:icon="isExpanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
						variant="ghost"
						color="neutral"
						size="sm"
						@click="isExpanded = !isExpanded"
					/>
				</div>
			</div>

			<!-- Bento Grid -->
			<div v-show="isExpanded" class="md:grid-cols-3 gap-4 grid grid-cols-1 transition-all">
				<!-- Summary Card (Spans 3 cols on mobile, 1 on md) -->
				<div class="rounded-xl border-default bg-elevated p-6 md:col-span-1 flex flex-col border">
					<h3 class="text-muted mb-4 text-sm font-semibold tracking-wider uppercase">
						{{ t("ai.collectionInsights.result.summaryTitle") }}
					</h3>
					<p class="prose prose-sm dark:prose-invert">{{ analysisResult.summary }}</p>
				</div>

				<!-- Type Distribution (Spans 3 cols on mobile, 2 on md) -->
				<div class="rounded-xl border-default bg-elevated p-6 md:col-span-2 flex flex-col border">
					<h3 class="text-muted mb-4 text-sm font-semibold tracking-wider uppercase">
						{{ t("ai.collectionInsights.result.typeDistributionTitle") }}
					</h3>
					<!-- Horizontal Stacked Bar -->
					<div
						class="h-8 mb-4 bg-muted border-default flex w-full overflow-hidden rounded-full border"
					>
						<div
							v-for="entry in analysisResult.typeDistribution"
							:key="entry.type"
							class="border-background/20 h-full border-r transition-all first:rounded-l-full last:rounded-r-full last:border-0 hover:opacity-80"
							:style="{ width: `${Math.max(entry.count * 10, 5)}%` }"
							:title="`${entry.type}: ${entry.count}`"
							:class="getTypeBgColorClass(entry.type)"
						></div>
					</div>
					<!-- Legend -->
					<div class="gap-2 flex flex-wrap">
						<UBadge
							v-for="entry in analysisResult.typeDistribution"
							:key="entry.type"
							color="neutral"
							variant="soft"
							class="capitalize"
						>
							{{ entry.type }} ({{ entry.count }})
						</UBadge>
					</div>
				</div>

				<!-- Strengths -->
				<div
					class="rounded-xl border-success/30 bg-success/5 p-6 md:col-span-1 relative flex flex-col overflow-hidden border"
				>
					<div class="-right-4 -top-4 absolute opacity-10">
						<UIcon name="i-lucide-trending-up" class="size-32 text-success" />
					</div>
					<h3
						class="text-success mb-4 text-sm font-semibold tracking-wider gap-2 flex items-center uppercase"
					>
						<UIcon name="i-lucide-check-circle-2" class="size-4" />
						{{ t("ai.collectionInsights.result.strengthsTitle") }}
					</h3>
					<ul class="gap-3 text-sm relative z-10 flex flex-col">
						<li
							v-for="(strength, index) in analysisResult.strengths"
							:key="index"
							class="gap-2 flex items-start"
						>
							<UIcon name="i-lucide-arrow-right" class="text-success mt-0.5 size-4 shrink-0" />
							<span>{{ strength }}</span>
						</li>
					</ul>
				</div>

				<!-- Gaps -->
				<div
					class="rounded-xl border-warning/30 bg-warning/5 p-6 md:col-span-2 relative flex flex-col overflow-hidden border"
				>
					<div class="-right-4 -top-4 absolute opacity-10">
						<UIcon name="i-lucide-alert-triangle" class="size-32 text-warning" />
					</div>
					<h3
						class="text-warning mb-4 text-sm font-semibold tracking-wider gap-2 flex items-center uppercase"
					>
						<UIcon name="i-lucide-alert-circle" class="size-4" />
						{{ t("ai.collectionInsights.result.gapsTitle") }}
					</h3>
					<div class="sm:grid-cols-2 gap-4 relative z-10 grid grid-cols-1">
						<div
							v-for="gap in analysisResult.gaps"
							:key="gap.type"
							class="bg-background/50 rounded-lg p-3 border-warning/20 border"
						>
							<div class="gap-2 mb-2 flex items-center">
								<UBadge color="warning" variant="subtle" class="capitalize">{{ gap.type }}</UBadge>
							</div>
							<p class="text-muted text-sm">{{ gap.reason }}</p>
						</div>
					</div>
				</div>

				<!-- Recommendations (Spans full width) -->
				<div class="rounded-xl border-default bg-elevated p-6 md:col-span-3 flex flex-col border">
					<h3
						class="text-primary mb-4 text-sm font-semibold tracking-wider gap-2 flex items-center uppercase"
					>
						<UIcon name="i-lucide-sparkles" class="size-4" />
						{{ t("ai.collectionInsights.result.recommendationsTitle") }}
					</h3>
					<div class="sm:grid-cols-2 lg:grid-cols-3 gap-4 grid grid-cols-1">
						<CollectionRecommendationCard
							v-for="rec in analysisResult.recommendations"
							:key="rec.pokemonName"
							:recommendation="rec"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
