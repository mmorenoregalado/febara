<script lang="ts" setup>
	const colorModeOptions: {
		value: string;
		label: string;
		icon: string;
	}[] = [
		{
			value: "system",
			label: "System",
			icon: "i-lucide-hard-drive",
		},
		{
			value: "light",
			label: "Light",
			icon: "i-lucide-sun",
		},
		{
			value: "dark",
			label: "Dark",
			icon: "i-lucide-moon",
		},
	];
</script>

<template>
	<DropdownMenuRadioGroup v-model="$colorMode.preference">
		<DropdownMenuRadioItem
			v-for="option of colorModeOptions"
			:key="option.value"
			:value="option.value"
			:data-test="`color-mode-toggle-item-${option.value}`"
		>
			<UIcon :name="option.icon" class="mr-2 size-4 opacity-50" />
			{{ option.label }}
		</DropdownMenuRadioItem>
	</DropdownMenuRadioGroup>
</template>
