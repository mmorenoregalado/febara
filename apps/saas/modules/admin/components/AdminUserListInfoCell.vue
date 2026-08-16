<script lang="ts" setup>
	import type { ApiRouterOutputs } from "@repo/api/orpc/router";

	type AdminUserRow = ApiRouterOutputs["admin"]["users"]["list"]["users"][number];

	const { user, isActivelyBanned } = defineProps<{
		user: AdminUserRow;
		isActivelyBanned: boolean;
	}>();

	const { t: translations } = useTranslations();
	const { formatDateTime } = useLocaleDate();
	const banTooltip = computed(() => {
		const reason = translations("admin.users.ban.status.reason", {
			reason: user.banReason ?? "",
		});
		const expiration = user.banExpires
			? translations("admin.users.ban.status.expires", {
					date: formatDateTime({
						date: user.banExpires instanceof Date ? user.banExpires : new Date(user.banExpires),
					}),
				})
			: translations("admin.users.ban.status.permanent");

		return `${reason} · ${expiration}`;
	});
</script>

<template>
	<div class="gap-2 flex items-center">
		<UserAvatar :name="user.name ?? user.email" :avatar-url="user.image" />
		<div class="min-w-0 leading-tight flex-1">
			<strong class="block">{{ user.name ?? user.email }}</strong>
			<small class="text-muted block">
				<span v-if="user.name" class="min-w-0 gap-1.5 inline-flex max-w-full items-center">
					<span class="min-w-0 leading-normal break-words">{{ user.email }}</span>
					<AdminEmailVerified :verified="user.emailVerified" />
				</span>
				<span v-else class="inline-flex items-center">
					<AdminEmailVerified :verified="user.emailVerified" />
				</span>
				{{ user.role === "admin" ? " – Admin" : "" }}
				<UTooltip v-if="isActivelyBanned" :delay-duration="0" :text="banTooltip">
					<UBadge color="error" variant="soft" size="xs">
						{{ translations("admin.users.ban.status.banned") }}
					</UBadge>
				</UTooltip>
			</small>
		</div>
	</div>
</template>
