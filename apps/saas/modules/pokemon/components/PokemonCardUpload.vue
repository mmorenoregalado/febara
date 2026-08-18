<script lang="ts" setup>
	const props = defineProps<{
		disabled?: boolean;
	}>();

	const emit = defineEmits<{
		select: [file: File];
	}>();

	const { t } = useTranslations();

	const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
	const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

	const localError = ref<string | null>(null);
	const isDraggingOver = ref(false);
	const dragCounter = ref(0);

	const {
		open: openNativeFileDialog,
		reset: resetFileDialog,
		onChange: onFilesSelected,
	} = useFileDialog({
		accept: "image/png,image/jpeg,image/jpg,image/webp",
		multiple: false,
	});

	const {
		open: openNativeCameraDialog,
		reset: resetCameraFileDialog,
		onChange: onCameraFilesSelected,
	} = useFileDialog({
		accept: "image/*",
		capture: "environment",
		multiple: false,
	});

	const validateAndEmit = (file: File | undefined) => {
		if (!file || props.disabled) {
			return;
		}

		if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
			localError.value = t("pokemon.identify.errors.invalidImage");
			return;
		}

		if (file.size > MAX_IMAGE_BYTES) {
			localError.value = t("pokemon.identify.errors.imageTooLarge");
			return;
		}

		localError.value = null;
		emit("select", file);
	};

	onFilesSelected((files) => {
		validateAndEmit(files?.[0]);
	});

	onCameraFilesSelected((files) => {
		validateAndEmit(files?.[0]);
	});

	const selectFile = () => {
		if (props.disabled) {
			return;
		}
		resetFileDialog();
		openNativeFileDialog();
	};

	const selectFromCamera = () => {
		if (props.disabled) {
			return;
		}
		resetCameraFileDialog();
		openNativeCameraDialog();
	};

	const onDragEnter = () => {
		dragCounter.value += 1;
		isDraggingOver.value = true;
	};

	const onDragLeave = () => {
		dragCounter.value = Math.max(0, dragCounter.value - 1);
		if (dragCounter.value === 0) {
			isDraggingOver.value = false;
		}
	};

	const onDrop = (event: DragEvent) => {
		dragCounter.value = 0;
		isDraggingOver.value = false;
		validateAndEmit(event.dataTransfer?.files?.[0]);
	};

	defineExpose({
		openFileDialog: selectFile,
		openCameraDialog: selectFromCamera,
	});
</script>

<template>
	<div class="gap-2 flex flex-col">
		<div
			role="button"
			:tabindex="disabled ? -1 : 0"
			:aria-label="t('pokemon.identify.upload.dragHint')"
			class="rounded-md border-default gap-2 p-8 flex cursor-pointer flex-col items-center justify-center border-2 border-dashed text-center transition-colors"
			:class="[
				disabled ? 'pointer-events-none opacity-50' : 'hover:border-primary',
				isDraggingOver ? 'border-primary bg-primary/5' : '',
			]"
			@click="selectFile"
			@keydown.enter.prevent="selectFile"
			@keydown.space.prevent="selectFile"
			@dragenter.prevent="onDragEnter"
			@dragover.prevent
			@dragleave.prevent="onDragLeave"
			@drop.prevent="onDrop"
		>
			<UIcon name="i-lucide-image-plus" class="text-dimmed h-8 w-8" />
			<p class="text-highlighted font-medium">{{ t("pokemon.identify.upload.dragHint") }}</p>
			<p class="text-muted text-sm">{{ t("pokemon.identify.upload.hint") }}</p>
			<div class="gap-2 flex flex-wrap justify-center">
				<UButton
					variant="soft"
					:label="t('pokemon.identify.upload.cta')"
					:disabled="disabled"
					@click.stop="selectFile"
				/>
				<UButton
					class="sm:hidden"
					icon="i-lucide-camera"
					variant="soft"
					color="neutral"
					:label="t('pokemon.identify.upload.takePhoto')"
					:disabled="disabled"
					@click.stop="selectFromCamera"
				/>
			</div>
		</div>

		<UAlert v-if="localError" color="error" aria-live="polite" :description="localError" />

		<div class="text-muted gap-1.5 text-sm flex flex-col">
			<p class="text-dimmed gap-1.5 font-medium flex items-center">
				<UIcon name="i-lucide-lightbulb" class="h-4 w-4 shrink-0" />
				{{ t("pokemon.identify.upload.tips.title") }}
			</p>
			<ul class="gap-1 pl-1 flex flex-col">
				<li class="gap-2 flex items-start">
					<UIcon name="i-lucide-check" class="mt-0.5 h-4 w-4 shrink-0" />
					<span>{{ t("pokemon.identify.upload.tips.lighting") }}</span>
				</li>
				<li class="gap-2 flex items-start">
					<UIcon name="i-lucide-check" class="mt-0.5 h-4 w-4 shrink-0" />
					<span>{{ t("pokemon.identify.upload.tips.flatSurface") }}</span>
				</li>
				<li class="gap-2 flex items-start">
					<UIcon name="i-lucide-check" class="mt-0.5 h-4 w-4 shrink-0" />
					<span>{{ t("pokemon.identify.upload.tips.fullCard") }}</span>
				</li>
			</ul>
		</div>
	</div>
</template>
