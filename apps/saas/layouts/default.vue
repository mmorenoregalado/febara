<script setup lang="ts">
	const route = useRoute();
	const { public: config } = useRuntimeConfig();
	const { logout, user } = useSession();
	const { t } = useTranslations();

	const isWideLayout = computed(() => route.meta.wide === true);
</script>

<template>
	<div class="py-6 bg-muted text-highlighted flex min-h-screen w-full">
		<div class="gap-8 flex w-full flex-col items-center justify-between">
			<div class="container">
				<div class="flex items-center justify-between">
					<a :href="config.marketingUrl ?? '#'" class="block">
						<Logo />
					</a>

					<div class="gap-2 flex items-center justify-end">
						<LocaleSwitch />
						<ColorModeToggle />
						<UTooltip v-if="user" :text="t('app.userMenu.logout')">
							<UButton
								:aria-label="t('app.userMenu.logout')"
								color="neutral"
								icon="i-lucide-log-out"
								variant="ghost"
								@click="logout"
							/>
						</UTooltip>
					</div>
				</div>
			</div>

			<div class="container flex justify-center">
				<main :class="isWideLayout ? 'max-w-5xl w-full' : 'max-w-md w-full'">
					<UCard variant="outline">
						<slot />
					</UCard>
				</main>
			</div>

			<Footer />
		</div>
	</div>
</template>
