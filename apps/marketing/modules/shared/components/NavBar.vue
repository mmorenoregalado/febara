<script setup lang="ts">
	const route = useRoute();
	const { t } = useTranslations();
	const { y: verticalScrollPosition } = useWindowScroll();
	const { public: config } = useRuntimeConfig();

	const isTop = computed(() => verticalScrollPosition.value <= 10);

	const localePath = useLocalePath();

	const mobileMenuOpen = ref(false);

	const isMenuItemActive = (to: string) => {
		return route.fullPath.startsWith(to);
	};

	const openMobileMenu = () => {
		mobileMenuOpen.value = true;
	};

	watch(
		() => route.fullPath,
		() => {
			mobileMenuOpen.value = false;
		},
	);

	type MenuItem = {
		label: string;
		to: string;
	};

	const menuItems = computed<MenuItem[]>(() => [
		{
			label: t("common.menu.faq"),
			to: localePath({ name: "index" }) + "#faq",
		},

		{
			label: t("common.menu.changelog"),
			to: localePath({ name: "changelog" }),
		},
		{
			label: t("common.menu.contact"),
			to: localePath({ name: "contact" }),
		},
		...(config.docsUrl
			? [
					{
						label: t("common.menu.docs"),
						to: config.docsUrl,
					},
				]
			: []),
	]);
</script>

<template>
	<nav
		:class="
			cn(
				'top-0 sticky z-50 w-full transition-[background-color,border-color,backdrop-filter] duration-300',
				isTop
					? 'border-b border-transparent bg-transparent'
					: 'backdrop-blur-xl border-default/60 bg-default/80 border-b',
			)
		"
		data-test="navigation"
	>
		<div class="container">
			<div class="gap-6 h-16 md:h-[4.25rem] flex items-center justify-stretch">
				<div class="flex flex-1 justify-start">
					<NuxtLinkLocale
						:to="{ name: 'index' }"
						class="block hover:no-underline active:no-underline"
					>
						<Logo class="font-heading" />
					</NuxtLinkLocale>
				</div>

				<div class="lg:flex hidden flex-1 items-center justify-center">
					<NuxtLink
						v-for="menuItem of menuItems"
						:key="menuItem.to"
						:to="menuItem.to"
						class="px-3 py-2 font-medium text-sm block shrink-0 transition-colors"
						:class="
							isMenuItemActive(menuItem.to)
								? 'text-highlighted'
								: 'text-highlighted/55 hover:text-touch'
						"
					>
						{{ menuItem.label }}
					</NuxtLink>
				</div>

				<div class="gap-2 md:gap-3 flex flex-1 items-center justify-end">
					<ColorModeToggle />
					<LocaleSwitch />

					<UButton
						class="lg:hidden"
						size="icon"
						variant="ghost"
						:aria-label="t('common.aria.menu')"
						@click="openMobileMenu"
					>
						<UIcon name="i-lucide-menu" class="size-4" />
					</UButton>
					<UDrawer v-model:open="mobileMenuOpen" direction="right" :ui="{ container: 'w-[280px]' }">
						<template #body>
							<div class="flex flex-col items-start justify-center">
								<NuxtLink
									v-for="menuItem of menuItems"
									:key="menuItem.to"
									:to="menuItem.to"
									class="px-3 py-2 font-medium text-base block shrink-0"
									:class="
										isMenuItemActive(menuItem.to) ? 'text-highlighted' : 'text-highlighted/60'
									"
								>
									{{ menuItem.label }}
								</NuxtLink>

								<NuxtLink
									v-if="config.saasUrl"
									:to="config.saasUrl"
									class="px-3 py-2 text-base block text-touch"
								>
									{{ t("common.menu.login") }}
								</NuxtLink>
							</div>
						</template>
					</UDrawer>

					<UButton
						v-if="config.saasUrl"
						class="lg:flex hidden border-touch/30 text-touch hover:bg-touch/10 hover:text-touch"
						:to="config.saasUrl"
						variant="outline"
					>
						{{ t("common.menu.login") }}
					</UButton>
				</div>
			</div>
		</div>
	</nav>
</template>
