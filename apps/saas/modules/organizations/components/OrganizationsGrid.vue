<script setup lang="ts">
	import { config as authConfig } from "@repo/auth/config";

	const { t } = useTranslations();
	const { setActiveOrganization } = useActiveOrganization();

	const { data: allOrganizations } = useOrganizationListQuery();
</script>

<template>
	<div>
		<h2 class="mb-2 text-lg font-semibold">
			{{ t("organizations.organizationsGrid.title") }}
		</h2>

		<div
			v-if="
				allOrganizations &&
				(allOrganizations.length > 0 || authConfig.organizations.enableUsersToCreateOrganizations)
			"
			class="gap-4 sm:grid-cols-2 lg:grid-cols-3 grid grid-cols-1"
		>
			<UCard
				v-for="organization of allOrganizations"
				:key="organization.id"
				class="cursor-pointer"
				@click="setActiveOrganization(organization.slug!)"
				:ui="{
					body: 'p-4!',
					root: 'rounded-xl!',
				}"
			>
				<div class="gap-4 flex items-center">
					<OrganizationLogo
						class="shrink-0"
						size="3xl"
						:name="organization.name ?? ''"
						:logo-url="organization.logo ?? ''"
						:ui="{ root: 'rounded-xl', image: 'rounded-xl' }"
					/>
					<div class="min-w-0 gap-2 flex flex-1 items-center">
						<h3 class="font-medium leading-tight">{{ organization.name }}</h3>
						<UIcon name="i-lucide-chevron-right" class="size-4 opacity-60" />
					</div>
				</div>
			</UCard>

			<UButton
				v-if="authConfig.organizations.enableUsersToCreateOrganizations"
				:to="'/new-organization'"
				variant="secondary"
				class="gap-2 rounded-xl! p-4! text-primary! bg-primary/10 hover:bg-primary/20 flex h-auto! items-center"
			>
				<UIcon name="i-lucide-plus-circle" class="mr-2 size-4" />
				{{ t("organizations.organizationsGrid.createNewOrganization") }}
			</UButton>
		</div>
	</div>
</template>
