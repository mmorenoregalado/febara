<script setup lang="ts">
	const { value: resolvedValue } = useColorMode();
</script>

<template>
	<UIcon :name="resolvedValue === 'light' ? 'i-lucide-sun' : 'i-lucide-moon'" class="size-4" />
</template>
