<script setup lang="ts">
	const { t } = useTranslations();
	const authClient = useAuthClient();
	const toast = useToast();
	const queryClient = useQueryClient();
	const { formatDate } = useLocaleDate();

	const { data: passkeys, isPending } = useUserPasskeysQuery();
	const editDialogOpen = ref(false);

	const closeEditDialog = () => {
		editDialogOpen.value = false;
	};
	const editingPasskeyId = ref<string | null>(null);
	const passkeyName = ref("");

	const getPasskeyIds = () => new Set(passkeys.value?.map((passkey) => passkey.id) ?? []);
	const isPasskeyCancellationError = (error: unknown) => {
		if (!(error instanceof Error)) {
			return false;
		}

		const message = error.message.toLowerCase();
		return (
			error.name === "AbortError" ||
			error.name === "NotAllowedError" ||
			message.includes("cancel") ||
			message.includes("abort")
		);
	};

	const refreshPasskeys = async () => {
		const updatedPasskeys = await authClient.passkey.listUserPasskeys({
			fetchOptions: {
				throw: true,
			},
		});
		queryClient.setQueryData(userPasskeyQueryKey, updatedPasskeys);

		return updatedPasskeys;
	};

	const openEditDialog = (passkey: { id: string; name?: string | null }) => {
		editingPasskeyId.value = passkey.id;
		passkeyName.value = passkey.name ?? "";
		editDialogOpen.value = true;
	};

	const addPasskey = async () => {
		const passkeyIdsBeforeAdd = getPasskeyIds();

		try {
			await authClient.passkey.addPasskey({
				name: t("settings.account.security.passkeys.defaultName"),
			});

			const updatedPasskeys = await refreshPasskeys();
			const addedPasskey = updatedPasskeys?.find((passkey) => !passkeyIdsBeforeAdd.has(passkey.id));

			if (!addedPasskey) {
				return;
			}

			toast.add({
				color: "success",
				title: t("settings.account.security.passkeys.notifications.addPasskey.success.title"),
			});

			openEditDialog(addedPasskey);
		} catch (error) {
			if (isPasskeyCancellationError(error)) {
				return;
			}

			toast.add({
				color: "error",
				title: t("settings.account.security.passkeys.notifications.addPasskey.error.title"),
			});
		}
	};

	const updatePasskey = async () => {
		if (!editingPasskeyId.value || !passkeyName.value.trim()) {
			return;
		}

		try {
			await authClient.passkey.updatePasskey({
				id: editingPasskeyId.value,
				name: passkeyName.value.trim(),
			});

			await refreshPasskeys();
			editDialogOpen.value = false;

			toast.add({
				color: "success",
				title: t("settings.account.security.passkeys.notifications.updatePasskey.success.title"),
			});
		} catch {
			toast.add({
				color: "error",
				title: t("settings.account.security.passkeys.notifications.updatePasskey.error.title"),
			});
		}
	};

	const deletePasskey = async (id: string) => {
		const loadingToast = toast.add({
			color: "primary",
			title: t("settings.account.security.passkeys.notifications.deletePasskey.loading.title"),
		});

		try {
			await authClient.passkey.deletePasskey({
				id,
			});

			await queryClient.invalidateQueries({
				queryKey: userPasskeyQueryKey,
			});

			toast.update(loadingToast.id, {
				color: "success",
				title: t("settings.account.security.passkeys.notifications.deletePasskey.success.title"),
			});
		} catch {
			toast.update(loadingToast.id, {
				color: "error",
				title: t("settings.account.security.passkeys.notifications.deletePasskey.error.title"),
			});
		}
	};
</script>

<template>
	<SettingsItem
		:title="$t('settings.account.security.passkeys.title')"
		:description="$t('settings.account.security.passkeys.description')"
	>
		<div class="gap-2 grid grid-cols-1">
			<div v-if="isPending" class="gap-2 flex">
				<USkeleton class="size-6 shrink-0" />
				<div class="flex-1">
					<USkeleton class="mb-0.5 h-4 w-full" />
					<USkeleton class="h-8 w-full" />
				</div>
				<USkeleton class="size-9 shrink-0" />
			</div>
			<div v-for="passkey in passkeys" :key="passkey.id" class="gap-2 flex">
				<UIcon name="i-lucide-key" class="size-6 text-primary/50 shrink-0" />
				<div class="flex-1">
					<strong class="text-sm block">
						{{ passkey.name ?? $t("settings.account.security.passkeys.defaultName") }}
					</strong>
					<small class="text-muted text-xs leading-tight block">
						{{
							formatDate({
								date: passkey.createdAt ? new Date(passkey.createdAt) : null,
							})
						}}
					</small>
				</div>
				<div class="gap-2 flex shrink-0">
					<UButton
						variant="secondary"
						size="sm"
						square
						:aria-label="$t('settings.account.security.passkeys.editPasskey')"
						@click="openEditDialog(passkey)"
					>
						<UIcon name="i-lucide-pencil" class="size-4" />
					</UButton>
					<UButton variant="secondary" size="sm" square @click="deletePasskey(passkey.id)">
						<UIcon name="i-lucide-trash" class="size-4" />
					</UButton>
				</div>
			</div>

			<div class="flex justify-start">
				<UButton variant="secondary" @click="addPasskey">
					<UIcon name="i-lucide-plus" class="mr-1.5 size-4" />
					{{ $t("settings.account.security.passkeys.addPasskey") }}
				</UButton>
			</div>
		</div>
	</SettingsItem>

	<UModal v-model:open="editDialogOpen">
		<template #header>
			<h3 class="text-lg font-semibold">
				{{ $t("settings.account.security.passkeys.editDialog.title") }}
			</h3>
		</template>

		<template #body>
			<form class="gap-4 flex flex-col" @submit.prevent="updatePasskey">
				<UFormField :label="$t('settings.account.security.passkeys.editDialog.nameLabel')">
					<UInput v-model="passkeyName" autofocus />
				</UFormField>
				<div class="gap-2 flex justify-end">
					<UButton type="button" variant="outline" @click="closeEditDialog">
						{{ $t("common.confirmation.cancel") }}
					</UButton>
					<UButton type="submit" :disabled="!passkeyName.trim()">
						{{ $t("settings.account.security.passkeys.editDialog.submit") }}
					</UButton>
				</div>
			</form>
		</template>
	</UModal>
</template>
