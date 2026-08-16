<script setup lang="ts">
	const { t } = useTranslations();

	useSeoMeta({
		title: t("organizations.settings.title"),
	});
</script>

<template>
	<SettingsList>
		<OrganizationLogoForm />
		<OrganizationNameForm />
		<OrganizationDeleteForm />
	</SettingsList>
</template>
