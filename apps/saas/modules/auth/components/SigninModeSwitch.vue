<script setup lang="ts">
	type ActiveMode = "password" | "magic-link";

	const props = defineProps<{
		modelValue: ActiveMode;
	}>();

	const emit = defineEmits<{
		"update:modelValue": [value: ActiveMode];
	}>();

	const modes: {
		value: ActiveMode;
		label: string;
	}[] = [
		{
			value: "password",
			label: "Password",
		},
		{
			value: "magic-link",
			label: "Magic Link",
		},
	];

	const modelValue = computed({
		get: () => props.modelValue,
		set: (value) => emit("update:modelValue", value as ActiveMode),
	});

	const tabsItems = computed(() =>
		modes.map((mode) => ({
			label: mode.label,
			value: mode.value,
		})),
	);
</script>

<template>
	<UTabs
		v-model="modelValue"
		:items="tabsItems"
		class="w-full"
		variant="link"
		color="primary"
		:ui="{
			trigger: 'flex-1',
		}"
	/>
</template>
