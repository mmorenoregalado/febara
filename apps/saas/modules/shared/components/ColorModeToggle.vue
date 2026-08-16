<script setup lang="ts">
	const colorModeOptions = [
		{
			value: "system",
			labelKey: "common.colorMode.system",
			icon: "i-lucide-monitor-cog",
		},
		{
			value: "light",
			labelKey: "common.colorMode.light",
			icon: "i-lucide-sun",
		},
		{
			value: "dark",
			labelKey: "common.colorMode.dark",
			icon: "i-lucide-moon",
		},
	] as const;

	const colorMode = useColorMode();
	const { t } = useTranslations();

	const activeIndex = computed(() =>
		Math.max(
			0,
			colorModeOptions.findIndex((option) => option.value === colorMode.preference),
		),
	);
</script>

<template>
	<div
		class="gap-0 p-0.5 bg-muted relative inline-flex items-center rounded-full"
		data-test="color-mode-toggle"
	>
		<div
			class="left-0.5 top-0.5 h-7 w-7 ease-in-out border-default bg-default absolute rounded-full border transition-transform duration-200"
			:style="{ transform: `translateX(${activeIndex * 100}%)` }"
			aria-hidden="true"
		/>

		<UTooltip v-for="option in colorModeOptions" :key="option.value" :text="t(option.labelKey)">
			<button
				type="button"
				class="h-7 w-7 focus-visible:ring-primary relative z-10 flex cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
				:class="
					colorMode.preference === option.value
						? 'text-highlighted'
						: 'text-muted hover:text-highlighted'
				"
				:data-test="`color-mode-toggle-item-${option.value}`"
				:aria-label="t(option.labelKey)"
				:aria-pressed="colorMode.preference === option.value"
				@click="colorMode.preference = option.value"
			>
				<UIcon :name="option.icon" class="size-3.5" />
			</button>
		</UTooltip>
	</div>
</template>
