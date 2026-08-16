<script setup lang="ts">
	import { config as authConfig } from "@repo/auth/config";
</script>

<template>
	<div>
		<OrganizationsGrid v-if="authConfig.organizations.enable" />

		<UCard class="mt-6">
			<div class="h-64 p-8 text-muted flex items-center justify-center">
				Place your content here...
			</div>
		</UCard>
	</div>
</template>
