<script setup lang="ts">
	const PREVIEW_ADDRESS = "app.pokedexmanager.com";
	const SPARKLINE_WIDTH = 160;
	const SPARKLINE_HEIGHT = 48;

	const NAVIGATION_ITEMS = [
		{ key: "start", icon: "i-lucide-home", active: true },
		{ key: "chatbot", icon: "i-lucide-bot-message-square", active: false },
		{ key: "organizationSettings", icon: "i-lucide-settings", active: false },
		{ key: "accountSettings", icon: "i-lucide-user-cog", active: false },
	] as const;

	const METRIC_CARDS = [
		{
			key: "newClients",
			value: 344,
			valueFormat: "number" as const,
			trend: 0.12,
			color: "#3b82f6",
			gradientId: "hero-wireframe-clients",
			values: [275, 332, 347, 344],
		},
		{
			key: "revenue",
			value: 5243,
			valueFormat: "currency" as const,
			trend: 0.6,
			color: "#10b981",
			gradientId: "hero-wireframe-revenue",
			values: [3800, 5100, 4900, 5243],
		},
		{
			key: "churn",
			value: 0.03,
			valueFormat: "percentage" as const,
			trend: -0.3,
			color: "#8b5cf6",
			gradientId: "hero-wireframe-churn",
			values: [0.038, 0.032, 0.028, 0.03],
		},
	] as const;

	const CHART_MONTH_INDEXES = [1, 2, 3, 4] as const;

	function buildSparklinePaths(values: readonly number[]) {
		const minimumValue = Math.min(...values);
		const maximumValue = Math.max(...values);
		const valueRange = maximumValue - minimumValue || 1;
		const horizontalPadding = 2;
		const verticalPadding = 4;
		const drawableWidth = SPARKLINE_WIDTH - horizontalPadding * 2;
		const drawableHeight = SPARKLINE_HEIGHT - verticalPadding * 2;
		const step = drawableWidth / Math.max(values.length - 1, 1);

		const points = values.map((value, index) => ({
			x: horizontalPadding + index * step,
			y: verticalPadding + (1 - (value - minimumValue) / valueRange) * drawableHeight,
		}));

		const linePath = points
			.map(
				(point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`,
			)
			.join(" ");

		const firstPoint = points[0];
		const lastPoint = points.at(-1);

		if (!firstPoint || !lastPoint) {
			return { linePath: "", areaPath: "" };
		}

		const areaPath = `${linePath} L${lastPoint.x.toFixed(1)} ${SPARKLINE_HEIGHT} L${firstPoint.x.toFixed(1)} ${SPARKLINE_HEIGHT} Z`;

		return { linePath, areaPath };
	}

	const { t, n, locale } = useTranslations();

	const monthLabels = computed(() =>
		CHART_MONTH_INDEXES.map((monthIndex) =>
			new Intl.DateTimeFormat(locale.value, {
				month: "short",
				timeZone: "UTC",
			}).format(new Date(Date.UTC(2026, monthIndex, 1))),
		),
	);

	function formatMetricValue(value: number, valueFormat: "number" | "currency" | "percentage") {
		if (valueFormat === "currency") {
			return n(value, "currency");
		}

		if (valueFormat === "percentage") {
			return new Intl.NumberFormat(locale.value, { style: "percent" }).format(value);
		}

		return n(value, "number");
	}

	function formatTrend(trend: number) {
		return new Intl.NumberFormat(locale.value, {
			style: "percent",
			signDisplay: "exceptZero",
		}).format(trend);
	}

	const metricCards = computed(() =>
		METRIC_CARDS.map((metricCard) => {
			const { linePath, areaPath } = buildSparklinePaths(metricCard.values);
			return {
				...metricCard,
				title: t(`home.hero.preview.${metricCard.key}`),
				formattedValue: formatMetricValue(metricCard.value, metricCard.valueFormat),
				formattedTrend: formatTrend(metricCard.trend),
				trendPositive: metricCard.trend > 0,
				linePath,
				areaPath,
			};
		}),
	);
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

			<div class="md:min-h-[28rem] flex min-h-[22rem]">
				<aside class="w-52 p-3 md:flex border-default/60 hidden shrink-0 flex-col border-r">
					<div class="mb-3 flex items-center justify-between">
						<Logo :with-label="false" class="[&>svg]:size-6" />
						<UIcon name="i-lucide-panel-left" class="size-3.5 text-highlighted/35" />
					</div>

					<div
						class="gap-2 px-2 py-1.5 mb-4 rounded-lg border-default/70 bg-default flex items-center border"
					>
						<span class="size-6 rounded-md bg-highlighted/8 flex items-center justify-center">
							<Logo :with-label="false" class="[&>svg]:size-3.5" />
						</span>
						<span class="min-w-0 font-medium text-xs flex-1 truncate">
							{{ t("home.hero.preview.organization") }}
						</span>
						<UIcon name="i-lucide-chevrons-up-down" class="size-3 text-highlighted/35" />
					</div>

					<nav class="gap-0.5 flex flex-col">
						<div
							v-for="item in NAVIGATION_ITEMS"
							:key="item.key"
							:class="
								cn(
									'gap-2 px-2 py-1.5 text-xs rounded-md flex items-center',
									item.active ? 'font-medium text-highlighted bg-touch/10' : 'text-highlighted/50',
								)
							"
						>
							<UIcon
								:name="item.icon"
								:class="cn('size-3.5 shrink-0', item.active && 'text-touch')"
							/>
							<span class="truncate">{{ t(`home.hero.preview.${item.key}`) }}</span>
						</div>
					</nav>

					<div class="gap-2 pt-4 mt-auto flex items-center">
						<img :src="dummyPortraits.item1" alt="" class="size-7 rounded-full object-cover" />
						<div class="min-w-0 flex-1">
							<p class="font-medium text-xs text-highlighted truncate">
								{{ t("home.hero.preview.userName") }}
							</p>
							<p class="text-xs text-highlighted/40 truncate">
								{{ t("home.hero.preview.userEmail") }}
							</p>
						</div>
						<UIcon name="i-lucide-ellipsis-vertical" class="size-3.5 text-highlighted/35" />
					</div>
				</aside>

				<div class="min-w-0 p-4 sm:p-5 lg:p-6 bg-muted/35 flex-1">
					<h3 class="font-medium text-xl tracking-tight lg:text-2xl text-highlighted">
						{{ t("home.hero.preview.organization") }}
					</h3>
					<p class="mt-1 text-sm text-highlighted/50">{{ t("home.hero.preview.welcome") }}</p>

					<div class="mt-5 gap-3 sm:grid-cols-3 grid grid-cols-1">
						<div
							v-for="metricCard in metricCards"
							:key="metricCard.key"
							class="rounded-xl border-default/70 bg-elevated border"
						>
							<div class="p-3.5 pb-2">
								<p class="font-medium text-xs text-highlighted/50">{{ metricCard.title }}</p>
							</div>
							<div class="p-3.5 pt-0">
								<div class="flex items-center justify-between">
									<strong class="font-semibold text-lg tracking-tight text-highlighted">
										{{ metricCard.formattedValue }}
									</strong>
									<UBadge
										:color="metricCard.trendPositive ? 'success' : 'error'"
										variant="subtle"
										class="px-2 py-0.5 normal-case"
									>
										{{ metricCard.formattedTrend }}
									</UBadge>
								</div>
								<svg
									:viewBox="`0 0 ${SPARKLINE_WIDTH} ${SPARKLINE_HEIGHT}`"
									class="mt-3 h-12 w-full"
									aria-hidden="true"
								>
									<defs>
										<linearGradient :id="metricCard.gradientId" x1="0" y1="0" x2="0" y2="1">
											<stop offset="0%" :stop-color="metricCard.color" stop-opacity="0.35" />
											<stop offset="100%" :stop-color="metricCard.color" stop-opacity="0" />
										</linearGradient>
									</defs>
									<path :d="metricCard.areaPath" :fill="`url(#${metricCard.gradientId})`" />
									<path
										:d="metricCard.linePath"
										fill="none"
										:stroke="metricCard.color"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
								<div class="mt-1 gap-0 text-xs text-highlighted/35 flex justify-between">
									<span v-for="monthLabel in monthLabels" :key="monthLabel">{{ monthLabel }}</span>
								</div>
							</div>
						</div>
					</div>

					<div class="mt-4 rounded-xl border-default/70 bg-elevated border">
						<div
							class="h-36 sm:h-44 lg:h-52 text-sm text-highlighted/45 flex items-center justify-center"
						>
							{{ t("home.hero.preview.placeholder") }}
						</div>
					</div>
				</div>
			</div>
		</div>
	</figure>
</template>
