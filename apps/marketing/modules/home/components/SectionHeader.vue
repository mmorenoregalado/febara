<script setup lang="ts">
	defineOptions({ inheritAttrs: false });

	const attrs = useAttrs();
	const { align = "start", titleAs = "h2" } = defineProps<{
		eyebrow?: string;
		title: string;
		description?: string;
		align?: "start" | "center";
		titleAs?: "h1" | "h2";
	}>();
</script>

<template>
	<div
		:class="
			cn(
				'mb-16 lg:mb-24 max-w-3xl',
				align === 'center' && 'mx-auto text-center',
				attrs.class as string | undefined,
			)
		"
	>
		<p
			v-if="eyebrow"
			:class="
				cn(
					'mb-4 gap-2 font-medium text-sm tracking-wide flex items-center text-touch',
					align === 'center' && 'justify-center',
				)
			"
		>
			<span class="size-1.5 rounded-full bg-touch" aria-hidden="true" />
			{{ eyebrow }}
		</p>
		<component
			:is="titleAs"
			:class="
				cn(
					'font-medium text-3xl md:text-4xl lg:text-5xl tracking-tight text-highlighted leading-[1.12]',
					align === 'center' ? 'text-balance' : 'text-pretty',
				)
			"
		>
			{{ title }}
		</component>
		<p
			v-if="description"
			:class="
				cn(
					'text-base lg:text-lg mt-5 leading-relaxed text-highlighted/55',
					align === 'center' ? 'text-balance' : 'text-pretty',
				)
			"
		>
			{{ description }}
		</p>
	</div>
</template>
