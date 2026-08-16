<script setup lang="ts">
	const TESTIMONIAL_KEYS = ["item1", "item2", "item3"] as const;

	const { t } = useTranslations();
</script>

<template>
	<section id="testimonials" class="scroll-mt-20 py-24 lg:py-32 border-default/60 border-t">
		<div class="container">
			<SectionHeader
				:eyebrow="t('home.testimonials.badge')"
				:title="t('home.testimonials.title')"
				:description="t('home.testimonials.description')"
			/>

			<div class="gap-12 md:grid-cols-3 md:gap-16 grid grid-cols-1">
				<figure
					v-for="itemKey in TESTIMONIAL_KEYS"
					:key="itemKey"
					class="gap-8 flex flex-col justify-between"
				>
					<blockquote class="text-base leading-relaxed text-highlighted/70">
						<span class="text-touch">“</span>
						{{ t(`home.testimonials.items.${itemKey}.quote`) }}
						<span class="text-touch">”</span>
					</blockquote>
					<figcaption class="gap-3 flex items-center">
						<img :src="dummyPortraits[itemKey]" alt="" class="size-10 rounded-full object-cover" />
						<div>
							<p class="font-medium text-sm tracking-tight text-highlighted">
								{{ t(`home.testimonials.items.${itemKey}.name`) }}
							</p>
							<p class="mt-0.5 text-sm text-highlighted/45">
								{{ t(`home.testimonials.items.${itemKey}.role`) }}
							</p>
						</div>
					</figcaption>
				</figure>
			</div>
		</div>
	</section>
</template>
