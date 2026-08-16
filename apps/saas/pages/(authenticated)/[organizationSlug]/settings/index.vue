<script setup lang="ts">
	const { activeOrganization } = useActiveOrganization();

	if (!activeOrganization.value) {
		await navigateTo("/");
	} else {
		await navigateTo(`/${activeOrganization.value.slug}/settings/general`);
	}
</script>

<template>
	<div />
</template>
