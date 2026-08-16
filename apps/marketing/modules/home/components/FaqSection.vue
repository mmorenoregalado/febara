<script setup lang="ts">
	const FAQ_ITEM_KEYS = ["dataSecurity", "inviteTeam", "authMethods", "selfHost"] as const;

	const { t } = useTranslations();

	const items = computed(() =>
		FAQ_ITEM_KEYS.map((key) => ({
			label: t(`faq.items.${key}.question`),
			content: t(`faq.items.${key}.answer`),
		})),
	);
</script>

<template>
	<section id="faq" class="scroll-mt-20 py-24 lg:py-32">
		<div class="container">
			<div
				class="gap-14 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-24 lg:items-start grid grid-cols-1"
			>
				<div>
					<p class="mb-4 gap-2 font-medium text-sm tracking-wide flex items-center text-touch">
						<span class="size-1.5 rounded-full bg-touch" aria-hidden="true" />
						{{ t("faq.badge") }}
					</p>
					<h2
						class="font-medium text-3xl md:text-4xl lg:text-5xl tracking-tight text-highlighted leading-[1.12] text-pretty"
					>
						{{ t("faq.title") }}
					</h2>
					<p class="text-base lg:text-lg mt-5 leading-relaxed text-highlighted/55 text-pretty">
						{{ t("faq.description") }}
					</p>
				</div>
				<UAccordion
					:items="items"
					class="w-full text-left"
					:ui="{
						root: 'w-full',
						item: 'px-0 border-default/60 border-b shadow-none',
						trigger: 'font-medium text-base py-6 text-left',
						label: 'font-medium text-highlighted text-base',
						content: 'leading-relaxed text-highlighted/55',
					}"
				/>
			</div>
		</div>
	</section>
</template>
