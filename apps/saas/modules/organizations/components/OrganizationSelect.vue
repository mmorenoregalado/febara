<script setup lang="ts">
	import type { ArrayOrNested, DropdownMenuItem } from "@nuxt/ui";
	import { config as authConfig } from "@repo/auth/config";

	import { cn } from "~/modules/shared/utils/classes";

	const props = withDefaults(
		defineProps<{
			collapsed?: boolean;
		}>(),
		{
			collapsed: false,
		},
	);

	const { t } = useTranslations();
	const { user } = useSession();
	const { activeOrganization, setActiveOrganization } = useActiveOrganization();

	const { data: allOrganizations } = useOrganizationListQuery();

	const handlePersonalAccountSelect = async () => {
		await setActiveOrganization(null);
	};

	const handleOrganizationSelect = async (organizationSlug: string) => {
		await setActiveOrganization(organizationSlug);
	};

	const menuItems = computed<ArrayOrNested<DropdownMenuItem>>(() => {
		if (!user.value) {
			return [];
		}

		const items: DropdownMenuItem[] = [];

		// Personal account section (if organizations aren't required)
		if (!authConfig.organizations.requireOrganization) {
			items.push({
				label: t("organizations.organizationSelect.personalAccount"),
				value: user.value.id,
				slot: "personal-account",
				onClick: handlePersonalAccountSelect,
				class: "flex cursor-pointer items-center justify-center gap-2 pl-3",
			});
			items.push({
				type: "separator" as const,
			});
		}

		// Organizations section
		items.push({
			type: "label" as const,
			label: t("organizations.organizationSelect.organizations"),
			class: "text-muted text-xs",
		});

		// Add organization items
		if (allOrganizations.value) {
			for (const organization of allOrganizations.value) {
				if (!organization.slug) continue;
				items.push({
					label: organization.name ?? "",
					value: organization.slug,
					slot: `organization-${organization.slug}`,
					onClick: () => handleOrganizationSelect(organization.slug!),
					class: "flex cursor-pointer items-center justify-center gap-2 pl-3",
				});
			}
		}

		// Create new organization link (if enabled)
		if (authConfig.organizations.enableUsersToCreateOrganizations) {
			items.push({
				label: t("organizations.organizationSelect.createNewOrganization"),
				icon: "i-lucide-plus",
				to: "/new-organization",
				class: "text-primary! cursor-pointer text-sm",
				slot: "create-organization",
			});
		}

		return items;
	});

	const triggerTooltipText = computed(() =>
		activeOrganization.value
			? activeOrganization.value.name
			: t("organizations.organizationSelect.personalAccount"),
	);

	const dropdownContent = computed(() => ({
		side: props.collapsed ? ("right" as const) : ("bottom" as const),
		align: props.collapsed ? ("start" as const) : ("center" as const),
	}));

	const triggerClass = computed(() =>
		cn(
			"gap-3 rounded-xl border-default bg-default flex w-full items-center justify-between border text-left transition-colors outline-none",
			props.collapsed ? "p-1.5 justify-center" : "py-1.5 pr-2.5 pl-1.5",
		),
	);
</script>

<template>
	<div v-if="user">
		<UDropdownMenu
			:items="menuItems"
			:content="dropdownContent"
			:ui="{ content: 'w-56 min-w-(--reka-dropdown-menu-trigger-width)' }"
		>
			<UTooltip v-if="props.collapsed" :text="triggerTooltipText" :popper="{ placement: 'right' }">
				<button type="button" :class="triggerClass">
					<div
						:class="
							cn('gap-3 flex flex-1 items-center overflow-hidden', {
								'flex flex-1 justify-center': props.collapsed,
							})
						"
					>
						<template v-if="activeOrganization">
							<OrganizationLogo
								:name="activeOrganization.name ?? ''"
								:logo-url="activeOrganization.logo ?? ''"
								avatar-class="size-8 shrink-0 rounded-md"
							/>
							<div v-if="!props.collapsed" class="min-w-0 gap-1 flex flex-1 flex-col leading-none">
								<span class="text-sm font-semibold leading-4 text-highlighted truncate">
									{{ activeOrganization.name }}
								</span>
							</div>
						</template>
						<template v-else>
							<span
								class="size-8 text-primary bg-primary/10 rounded-md flex shrink-0 items-center justify-center"
							>
								<UIcon name="i-lucide-user" class="size-4" />
							</span>
							<div v-if="!props.collapsed" class="min-w-0 flex flex-1 flex-col leading-none">
								<span class="text-sm font-semibold leading-4 text-highlighted truncate">
									{{ t("organizations.organizationSelect.personalAccount") }}
								</span>
							</div>
						</template>
					</div>
					<UIcon
						v-if="!props.collapsed"
						name="i-lucide-chevrons-up-down"
						class="size-4 text-muted shrink-0"
					/>
				</button>
			</UTooltip>
			<button v-else type="button" :class="triggerClass">
				<div class="gap-3 flex flex-1 items-center overflow-hidden">
					<template v-if="activeOrganization">
						<OrganizationLogo
							:name="activeOrganization.name ?? ''"
							:logo-url="activeOrganization.logo ?? ''"
							avatar-class="size-8 shrink-0 rounded-md"
						/>
						<div class="min-w-0 gap-1 flex flex-1 flex-col leading-none">
							<span class="text-sm font-semibold leading-4 text-highlighted truncate">
								{{ activeOrganization.name }}
							</span>
						</div>
					</template>
					<template v-else>
						<span
							class="size-8 text-primary bg-primary/10 rounded-md flex shrink-0 items-center justify-center"
						>
							<UIcon name="i-lucide-user" class="size-4" />
						</span>
						<div class="min-w-0 flex flex-1 flex-col leading-none">
							<span class="text-sm font-semibold leading-4 text-highlighted truncate">
								{{ t("organizations.organizationSelect.personalAccount") }}
							</span>
						</div>
					</template>
				</div>
				<UIcon name="i-lucide-chevrons-up-down" class="size-4 text-muted shrink-0" />
			</button>

			<!-- Personal account slot -->
			<template #personal-account>
				<div class="gap-2 flex flex-1 items-center justify-start">
					<span
						class="size-8 text-primary bg-primary/10 rounded-md flex shrink-0 items-center justify-center"
					>
						<UIcon name="i-lucide-user" class="size-4" />
					</span>
					{{ t("organizations.organizationSelect.personalAccount") }}
				</div>
			</template>

			<!-- Organization slots -->
			<template
				v-for="organization of allOrganizations?.filter((org) => org.slug)"
				:key="organization.id"
				#[`organization-${organization.slug}`]
			>
				<div class="gap-2 flex flex-1 items-center justify-start">
					<OrganizationLogo
						avatar-class="size-8"
						:name="organization.name ?? ''"
						:logo-url="organization.logo ?? ''"
					/>
					{{ organization.name }}
				</div>
			</template>

			<!-- Create organization slot -->
			<template #create-organization>
				<span class="gap-2 flex items-center">
					<UIcon name="i-lucide-plus" class="size-6 rounded-md bg-primary/20 p-1" />
					{{ t("organizations.organizationSelect.createNewOrganization") }}
				</span>
			</template>
		</UDropdownMenu>
	</div>
</template>
