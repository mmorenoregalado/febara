<script setup lang="ts">
	import {
		CategoryScale,
		Chart as ChartJS,
		Filler,
		LineElement,
		LinearScale,
		PointElement,
		Tooltip,
		type ChartData,
		type ChartOptions,
	} from "chart.js";
	import { Line } from "vue-chartjs";

	ChartJS.register(CategoryScale, Filler, LineElement, LinearScale, PointElement, Tooltip);

	const { n } = useTranslations();

	const { title, value, valueFormat, context, trend, chart, chartColor } = defineProps<{
		title: string;
		value: number;
		valueFormat: "currency" | "number" | "percentage";
		context?: string;
		trend?: number;
		chart?: {
			labels: string[];
			values: number[];
		};
		chartColor?: string;
	}>();

	const formattedValue = computed(() => {
		if (valueFormat === "currency") {
			return n(value, "currency");
		}

		if (valueFormat === "percentage") {
			return n(value, "percent");
		}

		return n(value, "number");
	});

	const formattedTrend = computed(() => {
		if (trend === undefined || trend === null) {
			return null;
		}

		return `${trend >= 0 ? "+" : ""}${n(trend, "percent")}`;
	});

	const lineColor = computed(() => chartColor ?? "#3b82f6");

	const chartData = computed<ChartData<"line"> | null>(() => {
		if (!chart) {
			return null;
		}

		return {
			labels: chart.labels,
			datasets: [
				{
					data: chart.values,
					borderColor: lineColor.value,
					backgroundColor: `${lineColor.value}1A`,
					fill: true,
					tension: 0.42,
					pointRadius: 0,
					borderWidth: 3,
				},
			],
		};
	});

	const chartOptions: ChartOptions<"line"> = {
		responsive: true,
		maintainAspectRatio: false,
		animation: false,
		interaction: {
			intersect: false,
			mode: "index",
		},
		plugins: {
			legend: {
				display: false,
			},
			tooltip: {
				displayColors: false,
				backgroundColor: "#111827",
				titleColor: "#f9fafb",
				bodyColor: "#f9fafb",
			},
		},
		scales: {
			x: {
				border: {
					display: false,
				},
				grid: {
					display: false,
				},
				ticks: {
					color: "#6b7280",
					font: {
						size: 13,
					},
				},
			},
			y: {
				beginAtZero: true,
				border: {
					display: false,
				},
				grid: {
					color: "rgba(15, 23, 42, 0.08)",
					drawTicks: false,
				},
				ticks: {
					display: false,
					maxTicksLimit: 3,
				},
			},
		},
	};
</script>

<template>
	<UCard
		variant="outline"
		:ui="{
			root: 'rounded-[2rem] shadow-none',
			header: 'px-6 pt-6 font-medium text-highlighted pb-0 border-b-0 text-[15px]',
			body: 'px-6 pt-4 pb-6',
		}"
	>
		<template #header>
			{{ title }}
		</template>

		<div class="gap-4 flex items-center justify-between">
			<strong class="text-2xl font-bold tracking-tight md:text-4xl">
				{{ formattedValue }}
				<small v-if="context">{{ context }}</small>
			</strong>
			<UBadge
				v-if="trend && formattedTrend"
				:color="trend > 0 ? 'success' : 'error'"
				variant="soft"
				size="lg"
				class="px-4 py-1 text-base font-semibold rounded-full"
			>
				{{ formattedTrend }}
			</UBadge>
		</div>

		<div v-if="chartData" class="mt-5 h-24 overflow-hidden">
			<ClientOnly>
				<Line :data="chartData" :options="chartOptions" />
			</ClientOnly>
		</div>
	</UCard>
</template>
