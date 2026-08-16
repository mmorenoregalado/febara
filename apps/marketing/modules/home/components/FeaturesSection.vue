<script setup lang="ts">
	interface FeatureHighlight {
		title: string;
		description: string;
		icon: string;
	}

	interface FeatureItem {
		id: string;
		title: string;
		subtitle?: string;
		description?: string;
		preview: "teams" | "security";
		highlights: FeatureHighlight[];
	}

	const { t } = useTranslations();

	const featureItems = computed<FeatureItem[]>(() => [
		{
			id: "feature1",
			title: t("home.features.feature1.title"),
			subtitle: t("home.features.feature1.subtitle"),
			description: t("home.features.feature1.description"),
			preview: "teams",
			highlights: [
				{
					title: t("home.features.feature1.benefit1.title"),
					description: t("home.features.feature1.benefit1.description"),
					icon: "i-lucide-shield-check",
				},
				{
					title: t("home.features.feature1.benefit2.title"),
					description: t("home.features.feature1.benefit2.description"),
					icon: "i-lucide-user-plus",
				},
				{
					title: t("home.features.feature1.benefit3.title"),
					description: t("home.features.feature1.benefit3.description"),
					icon: "i-lucide-arrow-left-right",
				},
			],
		},
		{
			id: "feature2",
			title: t("home.features.feature2.title"),
			subtitle: t("home.features.feature2.subtitle"),
			description: t("home.features.feature2.description"),
			preview: "security",
			highlights: [
				{
					title: t("home.features.feature2.benefit1.title"),
					description: t("home.features.feature2.benefit1.description"),
					icon: "i-lucide-fingerprint",
				},
				{
					title: t("home.features.feature2.benefit2.title"),
					description: t("home.features.feature2.benefit2.description"),
					icon: "i-lucide-lock-keyhole",
				},
				{
					title: t("home.features.feature2.benefit3.title"),
					description: t("home.features.feature2.benefit3.description"),
					icon: "i-lucide-mail",
				},
			],
		},
	]);
</script>

<template>
	<section id="features" class="scroll-my-20 py-24 lg:py-32">
		<div class="container">
			<SectionHeader
				:eyebrow="t('home.features.badge')"
				:title="t('home.features.title')"
				:description="t('home.features.description')"
			/>

			<div class="gap-24 lg:gap-32 flex flex-col">
				<div v-for="(item, index) in featureItems" :key="item.id">
					<div class="gap-12 lg:grid-cols-2 lg:gap-20 grid grid-cols-1 items-center">
						<div :class="cn({ 'lg:order-2': index % 2 === 1 })">
							<FeaturePreview :variant="item.preview" />
						</div>

						<div :class="cn({ 'lg:order-1': index % 2 === 1 })">
							<h3
								class="font-medium text-2xl lg:text-3xl tracking-tight text-highlighted text-pretty"
							>
								{{ item.title }}
							</h3>
							<p
								v-if="item.subtitle"
								class="mt-4 text-base leading-relaxed text-highlighted/70 text-pretty"
							>
								{{ item.subtitle }}
							</p>
							<p v-if="item.description" class="mt-3 text-sm leading-relaxed text-highlighted/50">
								{{ item.description }}
							</p>
						</div>
					</div>

					<div
						v-if="item.highlights.length > 0"
						class="mt-12 gap-x-10 gap-y-10 sm:grid-cols-3 lg:mt-16 grid"
					>
						<div
							v-for="highlight in item.highlights"
							:key="highlight.title"
							class="flex flex-col items-start"
						>
							<UIcon :name="highlight.icon" class="mb-4 size-6 text-touch" />
							<strong class="font-medium text-sm block">{{ highlight.title }}</strong>
							<p class="mt-2 text-sm leading-relaxed text-highlighted/50">
								{{ highlight.description }}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>
