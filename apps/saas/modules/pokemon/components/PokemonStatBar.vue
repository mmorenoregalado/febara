<script lang="ts" setup>
	withDefaults(
		defineProps<{
			label: string;
			value: number;
			max?: number;
		}>(),
		{
			max: 255,
		},
	);
</script>

<template>
	<div class="gap-2 grid grid-cols-[6rem_1fr_2.5rem] items-center">
		<span class="text-muted text-sm">{{ label }}</span>
		<UProgress :model-value="value" :max="max" size="sm" />
		<span class="text-sm font-medium text-right">{{ value }}</span>
	</div>
</template>
