<script setup lang="ts">
	import type { ArrayOrNested, DropdownMenuItem } from "@nuxt/ui";

	const props = withDefaults(
		defineProps<{
			showUserName?: boolean;
		}>(),
		{
			showUserName: false,
		},
	);

	const { user, session } = useSession();
	const { t } = useTranslations();
	const toast = useToast();
	const authClient = useAuthClient();
	const { public: config } = useRuntimeConfig();
	const isMobile = useMediaQuery("(max-width: 767px)");

	const dropdownContent = computed(() => {
		const side = isMobile.value ? "bottom" : props.showUserName ? "top" : "right";
		const align = isMobile.value || !props.showUserName ? "end" : "start";
		return { side, align } as const;
	});

	const unimpersonate = async () => {
		const toastId = toast.add({
			color: "primary",
			title: t("app.userMenu.unimpersonate"),
		});
		await authClient.admin.stopImpersonating();
		toast.remove(toastId.id);
		window.location.reload();
	};

	const onLogout = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: async () => {
					const redirectUrl = new URL(
						config.redirectAfterLogout,
						window.location.origin,
					).toString();
					window.location.href = redirectUrl;
				},
			},
		});
	};

	const menuItems = computed(() => {
		if (!user.value) return [];

		const items: ArrayOrNested<DropdownMenuItem> = [
			{
				type: "label" as const,
				label: user.value.name ?? "",
				slot: "user-label",
			},
			{
				type: "separator" as const,
			},
			{
				type: "label" as const,
				label: t("app.userMenu.colorMode"),
				slot: "color-mode",
			},
			{
				type: "separator" as const,
			},
			{
				label: t("app.userMenu.accountSettings"),
				icon: "i-lucide-settings",
				to: "/settings/account/general",
			},
			...(config.docsUrl
				? [
						{
							label: t("app.userMenu.documentation"),
							icon: "i-lucide-book",
							href: config.docsUrl,
						},
					]
				: []),
			...(config.marketingUrl
				? [
						{
							label: t("app.userMenu.home"),
							icon: "i-lucide-home",
							href: config.marketingUrl,
						},
					]
				: []),
		];

		if (session.value?.impersonatedBy) {
			items.push({
				label: t("app.userMenu.unimpersonate"),
				icon: "i-lucide-user-minus",
				onSelect: unimpersonate,
			});
		}

		items.push({
			label: t("app.userMenu.logout"),
			icon: "i-lucide-log-out",
			onClick: onLogout,
		});

		return items;
	});
</script>

<template>
	<UDropdownMenu
		v-if="user"
		:items="menuItems"
		:content="dropdownContent"
		:ui="{ content: 'w-56 min-w-(--reka-dropdown-menu-trigger-width)' }"
	>
		<button
			type="button"
			class="gap-2 rounded-md focus-visible:ring-primary flex w-full cursor-pointer items-center justify-between outline-none focus-visible:ring-2"
			:class="{
				'md:w-full md:px-2 md:py-1.5 md:hover:bg-primary/5': props.showUserName,
				'rounded-full': !props.showUserName,
			}"
			aria-label="User menu"
		>
			<span class="gap-2 flex items-center">
				<UserAvatar :name="user.name ?? ''" :avatar-url="user.image" />
				<span v-if="props.showUserName" class="leading-tight text-left">
					<span class="font-medium text-sm">{{ user.name }}</span>
					<span class="text-xs block opacity-70">{{ user.email }}</span>
				</span>
			</span>

			<UIcon v-if="props.showUserName" name="i-lucide-more-vertical" class="size-4" />
		</button>

		<template #user-label>
			<div>
				{{ user.name }}
				<span class="font-normal text-xs block opacity-70">{{ user.email }}</span>
			</div>
		</template>

		<template #color-mode>
			<div class="gap-2 font-normal text-sm flex items-center justify-between">
				<span>{{ t("app.userMenu.colorMode") }}</span>
				<ColorModeToggle />
			</div>
		</template>
	</UDropdownMenu>
</template>
