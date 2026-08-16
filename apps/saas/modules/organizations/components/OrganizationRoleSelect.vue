<script setup lang="ts">
	import type { OrganizationMemberRole } from "@repo/auth";

	const props = defineProps<{
		disabled?: boolean;
		modelValue?: OrganizationMemberRole;
	}>();

	const emit = defineEmits<{
		"update:modelValue": [value: OrganizationMemberRole];
	}>();

	const roleOptions = useOrganizationMemberRoleOptions();

	const modelValue = computed({
		get: () => props.modelValue,
		set: (value) => emit("update:modelValue", value as OrganizationMemberRole),
	});
</script>

<template>
	<USelect
		v-model="modelValue"
		:items="roleOptions"
		:disabled="props.disabled"
		class="min-w-48"
		:ui="{ itemDescription: 'line-clamp-1' }"
	/>
</template>
