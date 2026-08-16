<script lang="ts" setup>
	const { t } = useTranslations();
	const toast = useToast();
	const showConfirmation = ref(false);

	const openConfirmation = () => {
		showConfirmation.value = true;
	};

	const closeConfirmation = () => {
		showConfirmation.value = false;
	};

	const { activeOrganization } = useActiveOrganization();
	const { check } = usePermissions();
	const authClient = useAuthClient();
	const canDeleteOrganization = computed(() => check("organization.delete"));

	const { mutate: deleteTeam, isPending } = useMutation({
		mutationFn: async () => {
			if (!activeOrganization.value?.id) {
				return;
			}

			try {
				await authClient.organization.delete({
					organizationId: activeOrganization.value.id,
				});

				toast.add({
					color: "success",
					title: t("organizations.settings.notifications.organizationDeleted"),
				});

				window.location.reload();
			} catch {
				toast.add({
					color: "error",
					title: t("organizations.settings.notifications.organizationNotDeleted"),
				});
			}
		},
	});
</script>

<template>
	<SettingsItem
		v-if="canDeleteOrganization"
		:title="$t('organizations.settings.deleteOrganization.title')"
		:description="$t('organizations.settings.deleteOrganization.description')"
		danger
	>
		<div class="flex h-full items-center justify-end">
			<UButton variant="solid" color="error" :loading="isPending" @click="openConfirmation">
				{{ $t("organizations.settings.deleteOrganization.submit") }}
			</UButton>
		</div>
	</SettingsItem>

	<UModal
		v-if="canDeleteOrganization"
		v-model:open="showConfirmation"
		:title="$t('organizations.settings.deleteOrganization.title')"
		:description="$t('organizations.settings.deleteOrganization.confirmation')"
	>
		<template #footer>
			<UButton variant="secondary" @click="closeConfirmation">
				{{ $t("common.confirmation.cancel") }}
			</UButton>
			<UButton
				variant="solid"
				color="error"
				:loading="isPending"
				@click="
					deleteTeam();
					showConfirmation = false;
				"
			>
				{{ $t("organizations.settings.deleteOrganization.submit") }}
			</UButton>
		</template>
	</UModal>
</template>
