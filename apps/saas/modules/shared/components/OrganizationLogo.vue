<script setup lang="ts">
	import type { AvatarProps } from "@nuxt/ui";

	const {
		name,
		logoUrl,
		size = "sm",
		cacheKey,
		ui,
	} = defineProps<{
		name: string;
		logoUrl?: string | null;
		size?: AvatarProps["size"];
		/** Optional cache-busting key (e.g. timestamp) to force refresh when logo is updated */
		cacheKey?: string | number | null;
		ui?: AvatarProps["ui"];
	}>();
	const { public: config } = useRuntimeConfig();

	const sanitizedLogoUrl = computed(() => {
		if (!logoUrl) return undefined;
		if (logoUrl.startsWith("http")) return logoUrl;

		const url = new URL(`/image-proxy/avatars/${logoUrl}`, config.siteUrl);
		if (cacheKey != null) {
			url.searchParams.set("v", `${cacheKey}`);
		}

		return url.toString();
	});
</script>

<template>
	<UAvatar
		:src="sanitizedLogoUrl"
		:alt="name"
		:size="size"
		:icon="sanitizedLogoUrl ? undefined : 'i-lucide-users'"
		:ui="{
			root: 'rounded-lg bg-touch/10 text-touch',
			fallback: 'bg-touch/10 text-touch uppercase',
			image: 'rounded-lg',
			...ui,
		}"
	/>
</template>
