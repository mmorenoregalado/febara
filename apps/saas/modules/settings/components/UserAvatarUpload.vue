<script setup lang="ts">
	const authClient = useAuthClient();

	const emit = defineEmits<{
		success: [];
		deleteSuccess: [];
		error: [];
	}>();

	const uploading = ref(false);
	const image = ref<File | null>(null);
	const cropDialogOpen = ref(false);
	const avatarVersion = ref<number>(0);
	const { user, reloadSession } = useSession();
	const { orpc } = useORPC();

	const createAvatarUploadUrlMutation = useMutation(orpc.users.avatarUploadUrl.mutationOptions());
	const deleteAvatarMutation = useMutation(orpc.users.deleteAvatar.mutationOptions());

	const {
		open: openFileDialog,
		reset: resetFileDialog,
		onChange: onFilesSelected,
	} = useFileDialog({
		accept: "image/png,image/jpeg,image/jpg",
		multiple: false,
	});

	const selectAvatarFile = () => {
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
		if (!croppedImageData || !user.value) {
			return;
		}

		uploading.value = true;

		try {
			const { signedUploadUrl, path } = await createAvatarUploadUrlMutation.mutateAsync({});

			await $fetch(signedUploadUrl, {
				method: "PUT",
				body: croppedImageData,
				headers: {
					"Content-Type": "image/png",
				},
			});

			await authClient.updateUser({
				image: path,
			});

			await reloadSession();

			avatarVersion.value = Date.now();

			emit("success");
		} catch (e) {
			emit("error");
		} finally {
			uploading.value = false;
		}
	};

	const deleteAvatar = async () => {
		if (!user.value?.image || uploading.value || deleteAvatarMutation.isPending.value) {
			return;
		}

		try {
			await deleteAvatarMutation.mutateAsync({});
			await reloadSession();
			avatarVersion.value = Date.now();

			emit("deleteSuccess");
		} catch (e) {
			emit("error");
		}
	};
</script>

<template>
	<div
		ref="dropZoneRef"
		class="size-24 rounded-md relative cursor-pointer"
		@click="selectAvatarFile"
	>
		<UserAvatar
			class="size-24 text-xl cursor-pointer"
			:avatarUrl="user?.image ?? ''"
			:name="user?.name ?? ''"
			:cache-key="avatarVersion"
		/>

		<UButton
			v-if="user?.image"
			size="xs"
			variant="secondary"
			square
			class="right-1 bottom-1 shadow absolute z-30 rounded-full transition-transform hover:scale-105 hover:opacity-100"
			:disabled="deleteAvatarMutation.isPending.value"
			:aria-label="$t('settings.account.avatar.delete')"
			@click.stop="deleteAvatar"
		>
			<UIcon name="i-lucide-trash" class="size-3.5" />
		</UButton>

		<div
			v-if="uploading || deleteAvatarMutation.isPending.value"
			class="bg-elevated/90 inset-0 absolute z-20 flex items-center justify-center rounded-full"
		>
			<UIcon name="i-lucide-loader" class="text-primary size-6 animate-spin" />
		</div>
	</div>

	<CropImageDialog
		:open="cropDialogOpen"
		:image="image"
		@open-change="(open: boolean) => (cropDialogOpen = open)"
		@save="(imageData: Blob | null) => (onCrop(imageData), (cropDialogOpen = false))"
	/>
</template>
