<script setup lang="ts">
	const { open, image } = defineProps<{
		open: boolean;
		image: File | null;
	}>();

	const emit = defineEmits<{
		openChange: [open: boolean];
		save: [croppedImageData: Blob | null];
	}>();

	const imageRef = ref<HTMLImageElement>();
	const cropperContainerRef = ref<HTMLDivElement>();
	const cropper = ref<InstanceType<Awaited<typeof import("cropperjs")>["default"]> | null>(null);
	const imageSrc = ref<string | null>(null);
	let cropperInitId = 0;
	let recenterTimeout: ReturnType<typeof setTimeout> | undefined;

	// v2 template: aspectRatio → cropper-selection aspect-ratio
	// autoCropArea: 0.95 → cropper-selection initial-coverage="0.95"
	// background: false → omit background on cropper-canvas
	// guides: true → cropper-grid (included in template)
	const CROPPER_TEMPLATE =
		'<cropper-canvas background scale-step="0">' +
		'<div class="cropper-image-clip">' +
		'<cropper-image initial-center-size="cover" rotatable scalable skewable translatable></cropper-image>' +
		"</div>" +
		'<div class="cropper-shade-clip">' +
		"<cropper-shade hidden></cropper-shade>" +
		"</div>" +
		'<cropper-handle action="select" plain></cropper-handle>' +
		'<cropper-selection aspect-ratio="1" initial-coverage="0.95" movable resizable outlined>' +
		'<cropper-grid role="grid" bordered covered></cropper-grid>' +
		"<cropper-crosshair centered></cropper-crosshair>" +
		'<cropper-handle action="move" theme-color="rgba(255, 255, 255, 0.35)"></cropper-handle>' +
		'<cropper-handle action="n-resize"></cropper-handle>' +
		'<cropper-handle action="e-resize"></cropper-handle>' +
		'<cropper-handle action="s-resize"></cropper-handle>' +
		'<cropper-handle action="w-resize"></cropper-handle>' +
		'<cropper-handle action="ne-resize"></cropper-handle>' +
		'<cropper-handle action="nw-resize"></cropper-handle>' +
		'<cropper-handle action="se-resize"></cropper-handle>' +
		'<cropper-handle action="sw-resize"></cropper-handle>' +
		"</cropper-selection>" +
		"</cropper-canvas>";

	watch(
		() => image,
		(newImage) => {
			if (imageSrc.value) {
				URL.revokeObjectURL(imageSrc.value);
				imageSrc.value = null;
			}
			if (newImage) {
				imageSrc.value = URL.createObjectURL(newImage);
			}
		},
		{ immediate: true },
	);

	onBeforeUnmount(() => {
		if (imageSrc.value) {
			URL.revokeObjectURL(imageSrc.value);
		}
		if (recenterTimeout) {
			clearTimeout(recenterTimeout);
		}
		// v2: destroy() removes cropper elements from DOM
		cropper.value?.destroy();
	});

	const constrainSelection = (e: Event) => {
		const detail = (e as CustomEvent).detail;
		const { x, y, width, height } = detail;
		const canvas = (e.target as Element).closest("cropper-canvas");
		if (!canvas) return;

		const bounds = getAvailableSelectionBounds(canvas as HTMLElement);

		if (
			x < bounds.x ||
			y < bounds.y ||
			x + width > bounds.x + bounds.width ||
			y + height > bounds.y + bounds.height
		) {
			e.preventDefault();
		}
	};

	const getAvailableSelectionBounds = (
		canvas: HTMLElement,
		cropperImage = canvas.querySelector("cropper-image"),
	) => {
		const canvasRect = canvas.getBoundingClientRect();

		if (!cropperImage) {
			return {
				x: 0,
				y: 0,
				width: canvas.offsetWidth,
				height: canvas.offsetHeight,
			};
		}

		const imageRect = cropperImage.getBoundingClientRect();
		const x = Math.max(0, Math.ceil(imageRect.left - canvasRect.left));
		const y = Math.max(0, Math.ceil(imageRect.top - canvasRect.top));
		const right = Math.min(canvas.offsetWidth, Math.floor(imageRect.right - canvasRect.left));
		const bottom = Math.min(canvas.offsetHeight, Math.floor(imageRect.bottom - canvasRect.top));

		if (right <= x || bottom <= y) {
			return {
				x: 0,
				y: 0,
				width: canvas.offsetWidth,
				height: canvas.offsetHeight,
			};
		}

		return {
			x,
			y,
			width: right - x,
			height: bottom - y,
		};
	};

	const syncCropperLayout = async (currentInitId: number) => {
		const currentCropper = cropper.value;
		if (!currentCropper || currentInitId !== cropperInitId) return;

		const cropperImage = currentCropper.getCropperImage();
		await cropperImage?.$ready();

		if (!cropper.value || currentInitId !== cropperInitId) return;

		cropperImage?.$resetTransform();
		cropperImage?.$center("cover");

		const canvas = currentCropper.getCropperCanvas();
		const selection = currentCropper.getCropperSelection();
		if (canvas && selection) {
			const bounds = getAvailableSelectionBounds(canvas, cropperImage);
			const selectionSize = Math.min(bounds.width, bounds.height) * 0.95;
			selection.$change(
				bounds.x + (bounds.width - selectionSize) / 2,
				bounds.y + (bounds.height - selectionSize) / 2,
				selectionSize,
				selectionSize,
				1,
				true,
			);
		}
	};

	const onImageLoaded = async () => {
		const currentInitId = ++cropperInitId;

		if (recenterTimeout) {
			clearTimeout(recenterTimeout);
		}

		await nextTick();
		await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
		await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

		if (!imageRef.value?.src || !cropperContainerRef.value || !open) return;

		cropper.value?.destroy();
		const { default: Cropper } = await import("cropperjs");

		if (currentInitId !== cropperInitId) return;

		const instance = new Cropper(imageRef.value, {
			container: cropperContainerRef.value,
			template: CROPPER_TEMPLATE,
		});
		cropper.value = instance;

		await syncCropperLayout(currentInitId);

		const selection = instance.getCropperSelection();
		selection?.addEventListener("change", constrainSelection);

		recenterTimeout = setTimeout(() => {
			void syncCropperLayout(currentInitId);
		}, 150);
	};

	watch(
		() => [open, imageSrc.value] as const,
		async ([isOpen, src]) => {
			if (!isOpen) {
				cropperInitId++;
				if (recenterTimeout) {
					clearTimeout(recenterTimeout);
				}
				cropper.value?.destroy();
				cropper.value = null;
			} else if (src) {
				await nextTick();
				if (imageRef.value?.complete) {
					onImageLoaded();
				}
			}
		},
	);

	const saveCroppedImageData = async () => {
		const selection = cropper.value?.getCropperSelection();
		if (!selection) {
			emit("save", null);
			return;
		}
		// v2: getCroppedCanvas → cropper-selection $toCanvas
		// maxWidth/maxHeight: 512 → width/height (1:1 aspect ratio)
		const canvas = await selection.$toCanvas({
			width: 512,
			height: 512,
		});
		const croppedImageData = canvas
			? await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve))
			: null;

		emit("save", croppedImageData);
	};

	const localOpen = computed({
		get: () => open,
		set: (value: boolean) => emit("openChange", value),
	});
</script>

<template>
	<UModal v-model:open="localOpen" :ui="{ content: 'overflow-hidden' }">
		<template #body>
			<div
				ref="cropperContainerRef"
				class="min-w-0 p-2 relative aspect-square w-full overflow-hidden"
			>
				<img
					v-if="image && imageSrc"
					ref="imageRef"
					:src="imageSrc"
					class="block size-full object-contain"
					@load="onImageLoaded"
				/>
			</div>
		</template>
		<template #footer>
			<UButton size="sm" @click="saveCroppedImageData">{{ $t("settings.save") }}</UButton>
		</template>
	</UModal>
</template>

<style scoped>
	:deep(cropper-canvas) {
		position: relative;
		display: block;
		width: 100%;
		max-width: 100%;
		min-width: 0;
		height: 100%;
		max-height: 100%;
		aspect-ratio: 1;
		overflow: hidden;
	}

	:deep(.cropper-image-clip),
	:deep(.cropper-shade-clip) {
		position: absolute;
		inset: 0;
		overflow: hidden;
		pointer-events: none;
	}

	:deep(.cropper-shade-clip) {
		clip-path: inset(0);
	}
</style>
