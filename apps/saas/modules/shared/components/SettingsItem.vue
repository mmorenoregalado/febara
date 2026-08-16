<script setup lang="ts">
	const {
		title,
		description,
		danger = false,
	} = defineProps<{
		title: string;
		description?: string;
		danger?: boolean;
	}>();
</script>

<template>
	<UCard>
		<div class="@container">
			<div class="@xl:grid-cols-[min(100%/3,360px)_auto] @xl:gap-8 gap-4 grid grid-cols-1">
				<div class="gap-1.5 @xl:pb-6 flex shrink-0 flex-col">
					<h3
						:class="{
							'text-error': danger,
						}"
						class="m-0 font-semibold leading-tight"
					>
						<slot name="title">{{ title }}</slot>
					</h3>
					<p v-if="description || $slots.description" class="m-0 text-muted text-sm">
						<slot name="description">{{ description }}</slot>
					</p>
				</div>
				<div>
					<slot />
				</div>
			</div>
		</div>
	</UCard>
</template>
