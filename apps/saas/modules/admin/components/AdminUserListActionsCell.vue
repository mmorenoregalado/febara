<script lang="ts" setup>
	import type { ApiRouterOutputs } from "@repo/api/orpc/router";

	import AdminUserBanDialog from "./AdminUserBanDialog.vue";
	import AdminUserEditDialog from "./AdminUserEditDialog.vue";

	type AdminUserRow = ApiRouterOutputs["admin"]["users"]["list"]["users"][number];
	type AdminUserMenuItem = {
		label: string;
		icon: string;
		onClick: () => void | Promise<void>;
	};

	const { user, isActivelyBanned } = defineProps<{
		user: AdminUserRow;
		isActivelyBanned: boolean;
	}>();

	const { t: translations } = useTranslations();
	const { user: currentUser } = useSession();
	const toast = useToast();
	const queryClient = useQueryClient();
	const authClient = useAuthClient();
	const { orpc } = useORPC();
	const isBanDialogOpen = ref(false);
	const isEditDialogOpen = ref(false);

	const openEditDialog = () => {
		isEditDialogOpen.value = true;
	};

	const openBanDialog = () => {
		isBanDialogOpen.value = true;
	};

	const impersonateUser = async (userId: string) => {
		const toastId = toast.add({
			color: "primary",
			title: translations("admin.users.impersonation.impersonating", {
				name: user.name ?? "",
			}),
		});
		await authClient.admin.impersonateUser({
			userId,
		});
		toast.remove(toastId.id);
		window.location.href = new URL("/", window.location.origin).toString();
	};

	const deleteUser = async (userId: string) => {
		const deleteUserToast = toast.add({
			color: "primary",
			title: translations("admin.users.deleteUser.deleting"),
		});
		try {
			await authClient.admin.removeUser({
				userId,
			});

			await queryClient.invalidateQueries({
				queryKey: orpc.admin.users.list.key(),
			});

			toast.update(deleteUserToast.id, {
				color: "success",
				title: translations("admin.users.deleteUser.deleted"),
			});
		} catch {
			toast.update(deleteUserToast.id, {
				color: "error",
				title: translations("admin.users.deleteUser.notDeleted"),
			});
		}
	};

	const resendVerificationMail = async (email: string) => {
		const resendVerificationMailToast = toast.add({
			color: "primary",
			title: translations("admin.users.resendVerificationMail.submitting"),
		});
		try {
			await authClient.sendVerificationEmail({
				email,
			});

			toast.update(resendVerificationMailToast.id, {
				color: "success",
				title: translations("admin.users.resendVerificationMail.success"),
			});
		} catch {
			toast.update(resendVerificationMailToast.id, {
				color: "error",
				title: translations("admin.users.resendVerificationMail.error"),
			});
		}
	};

	const unbanUser = async () => {
		const unbanUserToast = toast.add({
			color: "primary",
			title: translations("admin.users.ban.notifications.unbanning"),
		});

		try {
			await authClient.admin.unbanUser({
				userId: user.id,
			});

			await queryClient.invalidateQueries({
				queryKey: orpc.admin.users.list.key(),
			});

			toast.update(unbanUserToast.id, {
				color: "success",
				title: translations("admin.users.ban.notifications.unbanSuccess"),
			});
		} catch {
			toast.update(unbanUserToast.id, {
				color: "error",
				title: translations("admin.users.ban.notifications.unbanError"),
			});
		}
	};

	const menuItems = computed(() => {
		const items: AdminUserMenuItem[] = [
			{
				label: translations("admin.users.impersonate"),
				icon: "i-lucide-square-user",
				onClick: () => impersonateUser(user.id),
			},
		];

		if (!user.emailVerified) {
			items.push({
				label: translations("admin.users.resendVerificationMail.title"),
				icon: "i-lucide-repeat-1",
				onClick: () => resendVerificationMail(user.email),
			});
		}

		if (isActivelyBanned) {
			items.push({
				label: translations("admin.users.ban.actions.unban"),
				icon: "i-lucide-shield-check",
				onClick: unbanUser,
			});
		} else if (currentUser.value?.id !== user.id) {
			items.push({
				label: translations("admin.users.ban.actions.ban"),
				icon: "i-lucide-ban",
				onClick: openBanDialog,
			});
		}

		items.push({
			label: translations("admin.users.delete"),
			icon: "i-lucide-trash",
			onClick: () => deleteUser(user.id),
		});

		return items;
	});

	const onUserSaved = async () => {
		await queryClient.invalidateQueries({
			queryKey: orpc.admin.users.list.key(),
		});
	};
</script>

<template>
	<div class="gap-2 flex flex-row justify-end">
		<UButton
			size="sm"
			square
			variant="ghost"
			:aria-label="translations('admin.users.edit')"
			@click="openEditDialog"
		>
			<UIcon name="i-lucide-pencil" class="size-4" />
		</UButton>
		<UDropdownMenu :items="menuItems">
			<UButton size="sm" square variant="ghost">
				<UIcon name="i-lucide-more-vertical" class="size-4" />
			</UButton>
		</UDropdownMenu>
	</div>
	<AdminUserBanDialog v-model:open="isBanDialogOpen" :user="user" @saved="onUserSaved" />
	<AdminUserEditDialog v-model:open="isEditDialogOpen" :user="user" @saved="onUserSaved" />
</template>
