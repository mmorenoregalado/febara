<script setup lang="ts">
	const localePath = useLocalePath();
	const { public: config } = useRuntimeConfig();
	const { t } = useTranslations();
</script>

<template>
	<footer class="py-16 lg:py-20 text-sm border-default/60 text-highlighted/45 border-t">
		<div
			class="gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr] sm:gap-10 container grid grid-cols-1 items-start"
		>
			<div>
				<Logo class="font-heading opacity-70" />
				<p class="mt-4 max-w-xs text-sm leading-relaxed">
					© {{ new Date().getFullYear() }} {{ config.appName }}.
				</p>
			</div>

			<div class="gap-2.5 flex flex-col">
				<NuxtLink
					:to="localePath({ name: 'index' }) + '#features'"
					class="block transition-colors hover:text-touch"
				>
					{{ t("common.footer.features") }}
				</NuxtLink>
			</div>
		</div>
	</footer>
</template>
