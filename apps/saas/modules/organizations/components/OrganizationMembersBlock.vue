<script setup lang="ts">
	const { t } = useTranslations();
	const activeTab = ref<"members" | "invitations">("members");

	const { activeOrganization } = useActiveOrganization();

	const tabsItems = computed(() => [
		{
			label: t("organizations.settings.members.activeMembers"),
			value: "members",
		},
		{
			label: t("organizations.settings.members.pendingInvitations"),
			value: "invitations",
		},
	]);
</script>

<template>
	<SettingsItem
		:title="$t('organizations.settings.members.title')"
		:description="$t('organizations.settings.members.description')"
		v-if="activeOrganization"
	>
		<UTabs v-model="activeTab" :items="tabsItems" variant="link" class="mb-4" />

		<OrganizationMembersList
			v-if="activeTab === 'members'"
			:organization-id="activeOrganization.id"
		/>
		<OrganizationInvitationsList
			v-if="activeTab === 'invitations'"
			:organization-id="activeOrganization.id"
		/>
	</SettingsItem>
</template>
