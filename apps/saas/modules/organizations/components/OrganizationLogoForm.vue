<script setup lang="ts">
	const authClient = useAuthClient();

	const uploading = ref(false);
	const image = ref<File | null>(null);
	const cropDialogOpen = ref(false);
	const logoVersion = ref<number>(0);
	const { orpc } = useORPC();
	const toast = useToast();
	const { t } = useTranslations();
	const { activeOrganization, refetchActiveOrganization } = useActiveOrganization();
	const queryClient = useQueryClient();

	const createLogoUploadUrlMutation = useMutation(
		orpc.organizations.createLogoUploadUrl.mutationOptions(),
	);
	const deleteLogoMutation = useMutation(orpc.organizations.deleteLogo.mutationOptions());

	const {
		open: openFileDialog,
		reset: resetFileDialog,
		onChange: onFilesSelected,
	} = useFileDialog({
		accept: "image/*",
		multiple: false,
	});

	const selectLogoFile = () => {
		resetFileDialog();
		openFileDialog();
	};

	onFilesSelected((files) => {
		if (files?.[0]) {
			image.value = files[0];
			cropDialogOpen.value = true;
		}
	});

	const onCrop = async (croppedImageData: Blob | null) => {
		if (!croppedImageData || !activeOrganization.value) {
			return;
		}

		uploading.value = true;
		try {
			const { signedUploadUrl, path } = await createLogoUploadUrlMutation.mutateAsync({
				organizationId: activeOrganization.value.id,
			});

			await $fetch(signedUploadUrl, {
				method: "PUT",
				body: croppedImageData,
				headers: {
					"Content-Type": "image/png",
				},
			});

			await authClient.organization.update({
				organizationId: activeOrganization.value.id,
				data: {
					logo: path,
				},
			});

			await refetchActiveOrganization();
			await queryClient.invalidateQueries({
				queryKey: organizationListQueryKey,
			});

			logoVersion.value = Date.now();

			toast.add({
				color: "success",
				title: t("organizations.settings.notifications.organizationLogoUpdated"),
			});
		} catch (e) {
			toast.add({
				color: "error",
				title: t("organizations.settings.notifications.organizationLogoNotUpdated"),
			});
		} finally {
			uploading.value = false;
		}
	};

	const deleteLogo = async () => {
		if (!activeOrganization.value?.logo || deleteLogoMutation.isPending.value || uploading.value) {
			return;
		}

		const organizationId = activeOrganization.value.id;

		try {
			await deleteLogoMutation.mutateAsync({
				organizationId,
			});

			await refetchActiveOrganization();
			await queryClient.invalidateQueries({
				queryKey: organizationListQueryKey,
			});

			logoVersion.value = Date.now();

			toast.add({
				color: "success",
				title: t("organizations.settings.notifications.organizationLogoDeleted"),
			});
		} catch (e) {
			toast.add({
				color: "error",
				title: t("organizations.settings.notifications.organizationLogoNotDeleted"),
			});
		}
	};
</script>

<template>
	<SettingsItem
		:title="$t('organizations.settings.logo.title')"
		:description="$t('organizations.settings.logo.description')"
	>
		<div class="gap-4 flex items-center">
			<div ref="dropZoneRef" class="relative cursor-pointer rounded-full" @click="selectLogoFile">
				<OrganizationLogo
					class="size-24 text-xl cursor-pointer"
					:logo-url="activeOrganization?.logo ?? ''"
					:name="activeOrganization?.name ?? ''"
					:cache-key="logoVersion"
				/>

				<UButton
					v-if="activeOrganization?.logo"
					size="xs"
					variant="secondary"
					square
					class="right-1 bottom-1 shadow absolute z-30 rounded-full transition-transform hover:scale-105 hover:opacity-100"
					:disabled="deleteLogoMutation.isPending.value"
					:aria-label="$t('organizations.settings.logo.delete')"
					@click.stop="deleteLogo"
				>
					<UIcon name="i-lucide-trash" class="size-3.5" />
				</UButton>

				<div
					v-if="uploading || deleteLogoMutation.isPending.value"
					class="bg-elevated/90 inset-0 rounded-lg absolute z-20 flex items-center justify-center"
				>
					<UIcon name="i-lucide-loader" class="text-primary size-6 animate-spin" />
				</div>
			</div>
		</div>

		<CropImageDialog
			:open="cropDialogOpen"
			:image="image"
			@open-change="(open: boolean) => (cropDialogOpen = open)"
			@save="(imageData: Blob | null) => (onCrop(imageData), (cropDialogOpen = false))"
		/>
	</SettingsItem>
</template>
