<script setup lang="ts">
	import DefaultTheme from "vitepress/theme";

	const { Layout } = DefaultTheme;

	// Marketing URL from env - injected via vite.define in config
	const marketingUrl = (typeof __MARKETING_URL__ !== "undefined" ? __MARKETING_URL__ : "") || "";
</script>

<template>
	<Layout>
		<template #nav-bar-title-before>
			<a
				:href="marketingUrl || '/'"
				class="mr-4 flex items-center"
				:aria-label="marketingUrl ? 'Go to marketing site' : 'Go to docs home'"
			>
				<Logo :with-label="true" />
			</a>
		</template>
	</Layout>
</template>
