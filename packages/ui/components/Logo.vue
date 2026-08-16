<script setup lang="ts">
	const { withLabel = true } = defineProps<{
		withLabel?: boolean;
	}>();
</script>

<template>
	<span class="gap-2.5 text-highlighted flex items-center leading-none">
		<svg class="size-7 shrink-0" viewBox="0 0 32 32" :aria-hidden="withLabel">
			<title>PokeDex Manager</title>
			<circle cx="16" cy="16" r="13" fill="currentColor" />
			<rect x="3.2" y="14.5" width="25.6" height="3" fill="var(--touch)" class="fill-touch" />
			<circle cx="16" cy="16" r="4.6" fill="currentColor" />
			<circle
				cx="16"
				cy="16"
				r="4.6"
				fill="none"
				stroke="var(--touch)"
				stroke-width="1.3"
				class="stroke-touch"
			/>
			<circle cx="16" cy="16" r="1.6" fill="var(--touch)" class="fill-touch" />
		</svg>
		<span
			v-if="withLabel"
			class="font-semibold tracking-tight max-md:sr-only md:block font-heading text-[1.05rem]"
		>
			PokeDex Manager
		</span>
	</span>
</template>
