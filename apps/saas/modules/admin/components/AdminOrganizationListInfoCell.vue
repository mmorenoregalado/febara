<script lang="ts" setup>
	import type { ApiRouterOutputs } from "@repo/api/orpc/router";

	type AdminOrganizationRow =
		ApiRouterOutputs["admin"]["organizations"]["list"]["organizations"][number];

	defineProps<{
		organization: AdminOrganizationRow;
	}>();

	const { t } = useTranslations();
</script>

<template>
	<div class="gap-2 flex items-center">
		<OrganizationLogo
			:name="organization.name ?? organization.slug ?? organization.id"
			:logo-url="organization.logo"
			avatar-class="size-10 shrink-0 rounded-md"
		/>
		<div class="min-w-0 leading-tight flex-1">
			<strong class="block truncate">{{ organization.name }}</strong>
			<small class="text-muted block">
				<span class="min-w-0 gap-1.5 inline-flex max-w-full items-center">
					<span class="min-w-0 leading-normal truncate">
						{{ organization.slug ?? organization.id }}
					</span>
				</span>
				<span class="block">
					{{ t("admin.organizations.membersCount", { count: organization.membersCount ?? 0 }) }}
				</span>
			</small>
		</div>
	</div>
</template>
