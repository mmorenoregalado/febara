<script setup lang="ts">
	import { config as authConfig } from "@repo/auth/config";

	const route = useRoute();
	const { t } = useTranslations();
	const { check } = usePermissions();
	const { activeOrganization } = useActiveOrganization();
	const canManageOrganization = computed(() => check("organization.manage"));
	const { isCollapsed, toggleCollapsed } = useSidebar();
	const {
		public: { useSidebarLayout },
	} = useRuntimeConfig();

	const basePath = computed(() =>
		activeOrganization.value ? `/${activeOrganization.value.slug}` : "/",
	);

	type MenuChildItem = {
		label: string;
		href: string;
		isActive: boolean;
	};

	type MenuItem = {
		label: string;
		href: string;
		icon: string;
		isActive: boolean;
		children?: MenuChildItem[];
	};

	const mobileMenuOpen = ref(false);
	const expandedMenuItems = ref<string[]>([]);
	/** Avoid double-toggle when a pointer gesture fires both `pointerup` and `click`. */
	const skipClickAfterPointer = ref(false);

	function handleSidebarEdgePointerDown(event: PointerEvent) {
		if (event.button !== 0) {
			return;
		}
		(event.currentTarget as HTMLButtonElement).setPointerCapture(event.pointerId);
	}

	function handleSidebarEdgePointerUp(event: PointerEvent) {
		if (event.button !== 0) {
			return;
		}
		const buttonElement = event.currentTarget as HTMLButtonElement;
		if (buttonElement.hasPointerCapture(event.pointerId)) {
			buttonElement.releasePointerCapture(event.pointerId);
		}
		skipClickAfterPointer.value = true;
		toggleCollapsed();
	}

	function handleSidebarEdgeClick(event: MouseEvent) {
		if (skipClickAfterPointer.value) {
			event.preventDefault();
			skipClickAfterPointer.value = false;
			return;
		}
		toggleCollapsed();
	}

	const openMobileMenu = () => {
		mobileMenuOpen.value = true;
	};

	const isActiveHref = (href: string) => {
		return route.path === href || route.path.startsWith(`${href}/`);
	};

	const menuItems = computed<MenuItem[]>(() => {
		const accountSettingsChildren: MenuChildItem[] = [
			{
				label: t("settings.menu.account.general"),
				href: "/settings/account/general",
				isActive: isActiveHref("/settings/account/general"),
			},
			{
				label: t("settings.menu.account.security"),
				href: "/settings/account/security",
				isActive: isActiveHref("/settings/account/security"),
			},
			{
				label: t("settings.menu.account.notifications"),
				href: "/settings/account/notifications",
				isActive: isActiveHref("/settings/account/notifications"),
			},
		];

		const items: MenuItem[] = [
			{
				label: t("app.menu.start"),
				href: basePath.value,
				icon: "i-lucide-home",
				isActive: route.path === basePath.value,
			},
			{
				label: t("app.menu.aiChatbot"),
				href: "/chatbot",
				icon: "i-lucide-bot-message-square",
				isActive: route.path.startsWith("/chatbot"),
			},
		];

		if (activeOrganization.value && canManageOrganization.value) {
			const organizationSettingsBasePath = `${basePath.value}/settings`;
			const organizationSettingsChildren: MenuChildItem[] = [
				{
					label: t("settings.menu.organization.general"),
					href: `${organizationSettingsBasePath}/general`,
					isActive: isActiveHref(`${organizationSettingsBasePath}/general`),
				},
				{
					label: t("settings.menu.organization.members"),
					href: `${organizationSettingsBasePath}/members`,
					isActive: isActiveHref(`${organizationSettingsBasePath}/members`),
				},
			];

			items.push({
				label: t("app.menu.organizationSettings"),
				href: organizationSettingsChildren[0]?.href ?? `${organizationSettingsBasePath}/general`,
				icon: "i-lucide-settings",
				isActive: route.path.startsWith(`${basePath.value}/settings/`),
				children: organizationSettingsChildren,
			});
		}

		items.push({
			label: t("app.menu.accountSettings"),
			href: accountSettingsChildren[0]?.href ?? "/settings/account/general",
			icon: "i-lucide-user-cog-2",
			isActive: route.path.startsWith("/settings/"),
			children: accountSettingsChildren,
		});

		if (check("admin.access")) {
			const adminChildren: MenuChildItem[] = [
				{
					label: t("admin.menu.users"),
					href: "/admin/users",
					isActive: isActiveHref("/admin/users"),
				},
				{
					label: t("admin.menu.organizations"),
					href: "/admin/organizations",
					isActive: isActiveHref("/admin/organizations"),
				},
			];

			items.push({
				label: t("app.menu.admin"),
				href: adminChildren[0]?.href ?? "/admin/users",
				icon: "i-lucide-user-cog",
				isActive: route.path === "/admin" || route.path.startsWith("/admin/"),
				children: adminChildren,
			});
		}

		return items;
	});

	const isMenuItemExpanded = (menuItem: MenuItem) => {
		if (useSidebarLayout && isCollapsed.value) {
			return false;
		}

		return expandedMenuItems.value.includes(menuItem.href);
	};

	const toggleMenuItem = (menuItem: MenuItem) => {
		if (useSidebarLayout && isCollapsed.value) {
			return;
		}

		if (expandedMenuItems.value.includes(menuItem.href)) {
			expandedMenuItems.value = expandedMenuItems.value.filter((href) => href !== menuItem.href);
			return;
		}

		expandedMenuItems.value = [...expandedMenuItems.value, menuItem.href];
	};

	const handleCollapsedMenuItemClick = (
		event: MouseEvent,
		menuItem: MenuItem,
		navigate: (event?: MouseEvent) => void,
	) => {
		if (useSidebarLayout && isCollapsed.value && menuItem.children?.length) {
			event.preventDefault();
			isCollapsed.value = false;
			expandedMenuItems.value = [...new Set([...expandedMenuItems.value, menuItem.href])];
			return;
		}

		navigate(event);
	};

	const getActiveSubmenuHrefs = (items: MenuItem[]) => {
		return items
			.filter((menuItem) => menuItem.children?.some((childItem) => childItem.isActive))
			.map((menuItem) => menuItem.href);
	};

	watch(
		menuItems,
		(items) => {
			expandedMenuItems.value = getActiveSubmenuHrefs(items);
		},
		{ immediate: true },
	);

	watch(
		() => route.fullPath,
		() => {
			mobileMenuOpen.value = false;
			expandedMenuItems.value = getActiveSubmenuHrefs(menuItems.value);
		},
	);
</script>

<template>
	<nav
		:class="[
			'w-full',
			{
				'md:fixed md:top-0 md:left-0 md:h-full': useSidebarLayout,
				'md:w-[280px]': useSidebarLayout && !isCollapsed,
				'md:w-[80px]': useSidebarLayout && isCollapsed,
			},
		]"
	>
		<div
			class="max-w-6xl py-4 container"
			:class="{
				'py-4 md:flex md:h-full md:flex-col md:px-4 md:pb-0': useSidebarLayout,
			}"
		>
			<div class="gap-6 flex flex-wrap items-center justify-between">
				<div
					class="gap-6 md:gap-2 flex items-center"
					:class="{
						'md:flex md:w-full md:flex-col md:items-stretch md:align-stretch': useSidebarLayout,
					}"
				>
					<div
						class="gap-2 md:w-full flex items-center"
						:class="{
							'md:flex-col md:items-center md:justify-center': useSidebarLayout && isCollapsed,
							'md:justify-between': useSidebarLayout && !isCollapsed,
						}"
					>
						<NuxtLink to="/" class="block shrink-0">
							<Logo :with-label="false" />
						</NuxtLink>
						<NotificationCenter v-if="useSidebarLayout" class="md:flex hidden shrink-0" />
					</div>

					<template
						v-if="authConfig.organizations.enable && !authConfig.organizations.hideOrganization"
					>
						<span
							v-if="!isCollapsed"
							class="md:block hidden opacity-30"
							:class="{ 'md:hidden': useSidebarLayout }"
						>
							<UIcon name="i-lucide-chevron-right" class="size-4" />
						</span>

						<OrganizationSelect
							:class="{
								'md:mt-2': useSidebarLayout && isCollapsed,
								'md:mt-3': useSidebarLayout && !isCollapsed,
								'md:flex md:justify-center': useSidebarLayout && isCollapsed,
							}"
							:collapsed="isCollapsed && useSidebarLayout"
						/>
					</template>
				</div>

				<div
					class="mr-0 gap-2 ml-auto flex items-center justify-end"
					:class="{ 'md:hidden': useSidebarLayout }"
				>
					<NotificationCenter />
					<UserMenu />
					<UButton
						variant="ghost"
						size="icon"
						class="md:hidden"
						aria-label="Open navigation"
						@click="openMobileMenu"
					>
						<UIcon name="i-lucide-menu" class="size-4" />
					</UButton>
				</div>
			</div>

			<ul
				class="no-scrollbar mt-4 gap-2 text-sm list-none items-center justify-start overflow-x-auto"
				:class="{
					'md:flex hidden': true,
					'md:mx-0 md:mt-3 md:mb-6 md:flex md:flex-col md:items-stretch md:gap-1 md:px-0':
						useSidebarLayout,
					'md:items-center': useSidebarLayout && isCollapsed,
				}"
			>
				<li v-for="menuItem of menuItems" :key="menuItem.href">
					<UTooltip
						v-if="isCollapsed && useSidebarLayout"
						:text="menuItem.label"
						:popper="{ placement: 'right' }"
					>
						<NuxtLink :to="menuItem.href" custom v-slot="{ href, navigate }">
							<a
								:href="href"
								:class="
									cn(
										'gap-3 rounded-md px-3 py-2 flex items-center whitespace-nowrap transition-colors',
										{
											'font-semibold bg-touch/10': menuItem.isActive,
											'hover:bg-muted/50': !menuItem.isActive,
											'md:w-full': useSidebarLayout,
											'md:justify-center md:px-2': useSidebarLayout && isCollapsed,
										},
									)
								"
								@click="handleCollapsedMenuItemClick($event, menuItem, navigate)"
							>
								<UIcon
									:name="menuItem.icon"
									class="size-4 shrink-0"
									:class="menuItem.isActive ? 'text-touch' : 'text-muted opacity-60'"
								/>
								<span
									v-if="!useSidebarLayout || !isCollapsed"
									:class="{
										'text-highlighted': menuItem.isActive,
										'text-muted': !menuItem.isActive,
									}"
								>
									{{ menuItem.label }}
								</span>
							</a>
						</NuxtLink>
					</UTooltip>
					<div
						v-else-if="menuItem.children?.length"
						class="flex flex-col"
						:class="{ 'md:w-full': useSidebarLayout }"
					>
						<button
							type="button"
							:class="
								cn(
									'gap-3 rounded-md px-3 py-2 flex cursor-pointer items-center whitespace-nowrap transition-colors',
									{
										'font-semibold bg-touch/10': menuItem.isActive,
										'hover:bg-muted/50': !menuItem.isActive,
										'md:w-full': useSidebarLayout,
									},
								)
							"
							:aria-expanded="isMenuItemExpanded(menuItem)"
							@click="toggleMenuItem(menuItem)"
						>
							<UIcon
								:name="menuItem.icon"
								class="size-4 shrink-0"
								:class="menuItem.isActive ? 'text-touch' : 'text-muted opacity-60'"
							/>
							<span
								class="flex-1 text-left"
								:class="{
									'text-highlighted': menuItem.isActive,
									'text-muted': !menuItem.isActive,
								}"
							>
								{{ menuItem.label }}
							</span>
							<UIcon
								name="i-lucide-chevron-down"
								class="size-4 text-muted shrink-0 transition-transform"
								:class="{ 'rotate-180': isMenuItemExpanded(menuItem) }"
							/>
						</button>
						<ul
							v-if="isMenuItemExpanded(menuItem)"
							class="mt-1 ml-4 gap-1 border-default pl-3 flex list-none flex-col border-l"
						>
							<li v-for="childItem of menuItem.children" :key="childItem.href">
								<NuxtLink
									:to="childItem.href"
									:class="
										cn(
											'rounded-md px-3 py-2 flex items-center whitespace-nowrap transition-colors',
											{
												'font-semibold text-highlighted': childItem.isActive,
												'font-medium text-muted hover:text-highlighted': !childItem.isActive,
											},
										)
									"
								>
									{{ childItem.label }}
								</NuxtLink>
							</li>
						</ul>
					</div>
					<NuxtLink
						v-else
						:to="menuItem.href"
						:class="
							cn(
								'gap-3 rounded-md px-3 py-2 flex items-center whitespace-nowrap transition-colors',
								{
									'font-semibold bg-touch/10': menuItem.isActive,
									'hover:bg-muted/50': !menuItem.isActive,
									'md:w-full': useSidebarLayout,
									'md:justify-center md:px-2': useSidebarLayout && isCollapsed,
								},
							)
						"
					>
						<UIcon
							:name="menuItem.icon"
							class="size-4 shrink-0"
							:class="menuItem.isActive ? 'text-touch' : 'text-muted opacity-60'"
						/>
						<span
							v-if="!useSidebarLayout || !isCollapsed"
							:class="{
								'text-highlighted': menuItem.isActive,
								'text-muted': !menuItem.isActive,
							}"
						>
							{{ menuItem.label }}
						</span>
					</NuxtLink>
				</li>
			</ul>

			<UDrawer v-model:open="mobileMenuOpen" direction="right" :ui="{ container: 'w-[280px]' }">
				<template #body>
					<div class="gap-6 flex h-full flex-col">
						<div class="gap-3 flex items-center">
							<NuxtLink to="/" class="block">
								<Logo :with-label="false" />
							</NuxtLink>
						</div>
						<ul class="gap-2 text-sm flex list-none flex-col">
							<li v-for="menuItem of menuItems" :key="menuItem.href">
								<div v-if="menuItem.children?.length" class="flex flex-col">
									<button
										type="button"
										:class="
											cn(
												'gap-3 rounded-md px-3 py-2 flex cursor-pointer items-center whitespace-nowrap transition-colors',
												{
													'font-semibold bg-touch/10': menuItem.isActive,
													'hover:bg-muted/50': !menuItem.isActive,
												},
											)
										"
										:aria-expanded="isMenuItemExpanded(menuItem)"
										@click="toggleMenuItem(menuItem)"
									>
										<UIcon
											:name="menuItem.icon"
											class="size-4 shrink-0"
											:class="menuItem.isActive ? 'text-touch' : 'text-muted opacity-60'"
										/>
										<span
											class="flex-1 text-left"
											:class="{
												'text-highlighted': menuItem.isActive,
												'text-muted': !menuItem.isActive,
											}"
										>
											{{ menuItem.label }}
										</span>
										<UIcon
											name="i-lucide-chevron-down"
											class="size-4 text-muted shrink-0 transition-transform"
											:class="{ 'rotate-180': isMenuItemExpanded(menuItem) }"
										/>
									</button>
									<ul
										v-if="isMenuItemExpanded(menuItem)"
										class="mt-1 ml-4 gap-1 border-default pl-3 flex list-none flex-col border-l"
									>
										<li v-for="childItem of menuItem.children" :key="childItem.href">
											<NuxtLink
												:to="childItem.href"
												:class="
													cn(
														'rounded-md px-3 py-2 flex items-center whitespace-nowrap transition-colors',
														{
															'font-semibold text-highlighted': childItem.isActive,
															'font-medium text-muted hover:text-highlighted': !childItem.isActive,
														},
													)
												"
											>
												{{ childItem.label }}
											</NuxtLink>
										</li>
									</ul>
								</div>
								<NuxtLink
									v-else
									:to="menuItem.href"
									:class="
										cn(
											'gap-3 rounded-md px-3 py-2 flex items-center whitespace-nowrap transition-colors',
											{
												'font-semibold bg-touch/10': menuItem.isActive,
												'hover:bg-muted/50': !menuItem.isActive,
											},
										)
									"
								>
									<UIcon
										:name="menuItem.icon"
										class="size-4 shrink-0"
										:class="menuItem.isActive ? 'text-touch' : 'text-muted opacity-60'"
									/>
									<span
										:class="{
											'text-highlighted': menuItem.isActive,
											'text-muted': !menuItem.isActive,
										}"
									>
										{{ menuItem.label }}
									</span>
								</NuxtLink>
							</li>
						</ul>
					</div>
				</template>
			</UDrawer>

			<div
				class="mb-0 gap-2 pb-4 mt-auto hidden flex-col"
				:class="{
					'md:flex': useSidebarLayout,
					'md:items-center': useSidebarLayout && isCollapsed,
				}"
			>
				<div
					:class="{
						'md:flex md:justify-center': useSidebarLayout && isCollapsed,
					}"
					class="gap-2 flex items-center"
				>
					<UserMenu :show-user-name="!isCollapsed" />
				</div>
			</div>
		</div>

		<!--
			Vercel-style: ~8px to each side of the border (16px = w-4) toggles; chip is
			hidden until the strip is hovered or the control is focused.
		-->
		<button
			v-if="useSidebarLayout"
			type="button"
			class="group max-md:hidden md:absolute md:top-0 md:right-0 md:bottom-0 md:z-50 md:min-h-0 md:w-4 md:shrink-0 md:translate-x-1/2 m-0 p-0 pointer-events-auto cursor-col-resize border-0 bg-transparent outline-none"
			:aria-label="isCollapsed ? t('app.menu.expandSidebar') : t('app.menu.collapseSidebar')"
			@pointerdown="handleSidebarEdgePointerDown"
			@pointerup="handleSidebarEdgePointerUp"
			@click="handleSidebarEdgeClick"
		>
			<span
				class="h-7 w-7 border-default bg-default text-muted shadow-sm pointer-events-none absolute top-1/2 left-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
				aria-hidden="true"
			>
				<UIcon
					:name="isCollapsed ? 'i-lucide-chevron-right' : 'i-lucide-chevron-left'"
					class="size-3.5"
				/>
			</span>
		</button>
	</nav>
</template>
