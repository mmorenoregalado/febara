<script setup lang="ts">
	const { t } = useTranslations();
	const localePath = useLocalePath();
	const { public: config } = useRuntimeConfig();

	const signupUrl = computed(
		() => config.saasUrl && `${String(config.saasUrl).replace(/\/$/, "")}/signup`,
	);
</script>

<template>
	<section id="cta" class="scroll-mt-20 py-24 lg:py-36 border-default/60 border-t">
		<div class="container">
			<SectionHeader
				align="center"
				class="mb-0 lg:mb-0"
				:eyebrow="t('home.cta.badge')"
				:title="t('home.cta.title')"
				:description="t('home.cta.description')"
			/>

			<div class="mt-10 gap-3 flex flex-wrap items-center justify-center">
				<UButton v-if="signupUrl" size="lg" variant="primary" :to="signupUrl">
					{{ t("home.cta.primary") }}
					<UIcon name="i-lucide-arrow-right" class="ml-2 size-4" />
				</UButton>
				<UButton
					size="lg"
					variant="ghost"
					class="text-touch hover:bg-touch/10 hover:text-touch"
					:to="localePath({ name: 'contact' })"
				>
					{{ t("home.cta.secondary") }}
				</UButton>
			</div>
		</div>
	</section>
</template>
