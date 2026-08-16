<script setup lang="ts">
	import type { AvatarProps } from "@nuxt/ui";

	const { name, avatarUrl, cacheKey } = defineProps<{
		name: string;
		avatarUrl?: string | null;
		ui?: AvatarProps["ui"];
		/** Optional cache-busting key (e.g. timestamp) to force refresh when avatar is updated */
		cacheKey?: string | number | null;
	}>();
	const { public: config } = useRuntimeConfig();

	const initials = computed(() => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("");
	});

	const sanitizedAvatarUrl = computed(() => {
		if (!avatarUrl) return undefined;
		if (avatarUrl.startsWith("http")) return avatarUrl;

		const url = new URL(`/image-proxy/avatars/${avatarUrl}`, config.siteUrl);
		if (cacheKey != null) {
			url.searchParams.set("v", `${cacheKey}`);
		}

		return url.toString();
	});
</script>

<template>
	<UAvatar :src="sanitizedAvatarUrl" :text="initials" :alt="name" />
</template>
