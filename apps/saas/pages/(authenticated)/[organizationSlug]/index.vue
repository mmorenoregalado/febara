<script setup lang="ts">
	definePageMeta({
		layout: "app",
	});

	const { activeOrganization } = useActiveOrganization();
	const { t } = useTranslations();

	useSeoMeta({
		title: () => activeOrganization.value?.name ?? "",
	});

	const monthlyLabels = ["Jan", "Feb", "Mar", "Apr", "May"];
	const statTiles = [
		{
			title: "New clients",
			value: 344,
			valueFormat: "number" as const,
			trend: 0.12,
			chartColor: "#3b82f6",
			chart: {
				labels: monthlyLabels,
				values: [210, 198, 236, 244, 243],
			},
		},
		{
			title: "Revenue",
			value: 5243,
			valueFormat: "currency" as const,
			trend: 0.6,
			chartColor: "#10b981",
			chart: {
				labels: monthlyLabels,
				values: [3200, 2950, 3720, 3540, 3810],
			},
		},
		{
			title: "Churn",
			value: 0.03,
			valueFormat: "percentage" as const,
			trend: -0.3,
			chartColor: "#8b5cf6",
			chart: {
				labels: monthlyLabels,
				values: [4.8, 4.1, 3.5, 3.1, 3.2],
			},
		},
	];
</script>

<template>
	<UPageHeader
		:title="activeOrganization?.name"
		:description="t('organizations.start.subtitle')"
		class="mb-8 pt-0"
	/>

	<div class="mt-8 gap-4 lg:grid-cols-3 grid grid-cols-1">
		<StatsTile
			v-for="tile in statTiles"
			:key="tile.title"
			:title="tile.title"
			:value="tile.value"
			:value-format="tile.valueFormat"
			:trend="tile.trend"
			:chart="tile.chart"
			:chart-color="tile.chartColor"
		/>
	</div>

	<UCard class="mt-8">
		<div class="h-64 p-8 text-muted flex items-center justify-center">
			Place your content here...
		</div>
	</UCard>
</template>
