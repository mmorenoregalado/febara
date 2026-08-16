<script setup lang="ts">
	const { contentClass } = defineProps<{
		contentClass?: string;
	}>();

	const mainClasses = computed(() => cn("max-w-md w-full", contentClass));
</script>

<template>
	<div class="py-6 flex min-h-screen w-full">
		<div class="gap-8 flex w-full flex-col items-center justify-between">
			<div class="container">
				<div class="flex items-center justify-between">
					<NuxtLink to="/" class="block">
						<Logo :with-label="false" />
					</NuxtLink>

					<div class="gap-2 flex items-center justify-end">
						<LocaleSwitch />
						<ColorModeToggle />
					</div>
				</div>
			</div>

			<div class="container flex justify-center">
				<main :class="mainClasses">
					<slot />
				</main>
			</div>

			<Footer />
		</div>
	</div>
</template>
