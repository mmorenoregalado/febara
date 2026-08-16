<script setup lang="ts">
	const { public: runtimeConfig } = useRuntimeConfig();
	const { t } = useTranslations();

	const { docsUrl, saasUrl } = runtimeConfig;
</script>

<template>
	<section class="max-w-full overflow-x-hidden">
		<div class="pt-20 pb-10 md:pt-24 md:pb-12 lg:pt-28 lg:pb-14 container">
			<div class="max-w-5xl">
				<p
					class="mb-6 gap-2.5 font-medium text-sm tracking-wide text-highlighted/50 flex flex-wrap items-center"
				>
					<span
						class="px-2 py-0.5 font-semibold tracking-wide text-xs rounded-full bg-touch text-touch-foreground"
					>
						{{ t("home.hero.new") }}
					</span>
					{{ t("home.hero.featureBadge") }}
				</p>

				<h1
					class="font-medium text-4xl sm:text-5xl lg:text-6xl xl:text-7xl tracking-tight text-highlighted leading-[1.05] text-pretty"
				>
					{{ t("home.hero.title") }}
				</h1>

				<p
					class="mt-6 text-base sm:text-lg max-w-xl leading-relaxed text-highlighted/55 text-pretty"
				>
					{{ t("home.hero.subtitle") }}
				</p>

				<div class="mt-8 gap-3 flex flex-wrap items-center">
					<UButton v-if="saasUrl" size="lg" variant="primary" :to="saasUrl">
						{{ t("home.hero.getStarted") }}
						<UIcon name="i-lucide-arrow-right" class="ml-2 size-4" />
					</UButton>
					<UButton
						v-if="docsUrl"
						variant="ghost"
						size="lg"
						class="text-touch hover:bg-touch/10 hover:text-touch"
						:to="docsUrl"
					>
						{{ t("home.hero.documentation") }}
					</UButton>
				</div>
			</div>
		</div>

		<div class="container">
			<HeroWireframe />
		</div>
	</section>
</template>
