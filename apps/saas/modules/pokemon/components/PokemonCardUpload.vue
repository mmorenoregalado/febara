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

	const {
		open: openFileDialog,
		reset: resetFileDialog,
		onChange: onFilesSelected,
	} = useFileDialog({
		accept: "image/png,image/jpeg,image/jpg,image/webp",
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

	const selectFile = () => {
		if (props.disabled) {
			return;
		}
		resetFileDialog();
		openFileDialog();
	};

	const onDrop = (event: DragEvent) => {
		isDraggingOver.value = false;
		validateAndEmit(event.dataTransfer?.files?.[0]);
	};
</script>

<template>
	<div class="gap-2 flex flex-col">
		<div
			class="rounded-md border-default gap-2 p-8 flex cursor-pointer flex-col items-center justify-center border-2 border-dashed text-center transition-colors"
			:class="[
				disabled ? 'pointer-events-none opacity-50' : 'hover:border-primary',
				isDraggingOver ? 'border-primary bg-primary/5' : '',
			]"
			@click="selectFile"
			@dragover.prevent="isDraggingOver = true"
			@dragleave.prevent="isDraggingOver = false"
			@drop.prevent="onDrop"
		>
			<UIcon name="i-lucide-image-plus" class="text-dimmed h-8 w-8" />
			<p class="text-highlighted font-medium">{{ t("pokemon.identify.upload.dragHint") }}</p>
			<p class="text-muted text-sm">{{ t("pokemon.identify.upload.hint") }}</p>
			<UButton
				variant="soft"
				:label="t('pokemon.identify.upload.cta')"
				:disabled="disabled"
				@click.stop="selectFile"
			/>
		</div>

		<UAlert v-if="localError" color="error" :description="localError" />
	</div>
</template>
