<script setup lang="ts">
	const { t } = useTranslations();
	const { activeOrganization } = useActiveOrganization();

	useSeoMeta({
		title: t("organizations.settings.members.title"),
	});
</script>

<template>
	<SettingsList v-if="activeOrganization">
		<OrganizationInviteMemberForm :organization-id="activeOrganization.id" />
		<OrganizationMembersBlock />
	</SettingsList>
</template>
