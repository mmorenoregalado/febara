import { ORPCError } from "@orpc/client";
import type { ApiRouterOutputs } from "@repo/api/orpc/router";

type IdentifyState = "idle" | "image-selected" | "identifying" | "identified" | "error";
type IdentificationResult = ApiRouterOutputs["ai"]["identifyPokemonCard"];

const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const dataUrl = reader.result as string;
			resolve(dataUrl.slice(dataUrl.indexOf(",") + 1));
		};
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(file);
	});
}

function errorKeyFromORPCError(error: unknown): string {
	if (error instanceof ORPCError) {
		if (error.code === "BAD_REQUEST") {
			return "pokemon.identify.errors.invalidImage";
		}
		if (error.code === "PAYLOAD_TOO_LARGE") {
			return "pokemon.identify.errors.imageTooLarge";
		}
		if (error.code === "GATEWAY_TIMEOUT" || error.code === "BAD_GATEWAY") {
			return "pokemon.identify.errors.serviceUnavailable";
		}
	}
	return "pokemon.identify.errors.generic";
}

export const usePokemonCardIdentifier = () => {
	const { orpc } = useORPC();

	const state = ref<IdentifyState>("idle");
	const selectedFile = ref<File | null>(null);
	const previewUrl = ref<string | null>(null);
	const result = ref<IdentificationResult | null>(null);
	const errorKey = ref<string | null>(null);

	const identifyMutation = useMutation(orpc.ai.identifyPokemonCard.mutationOptions());

	const revokePreview = () => {
		if (previewUrl.value) {
			URL.revokeObjectURL(previewUrl.value);
		}
	};

	const selectImage = (file: File) => {
		if (!ACCEPTED_MIME_TYPES.includes(file.type as (typeof ACCEPTED_MIME_TYPES)[number])) {
			errorKey.value = "pokemon.identify.errors.invalidImage";
			state.value = "error";
			return;
		}
		if (file.size > MAX_IMAGE_BYTES) {
			errorKey.value = "pokemon.identify.errors.imageTooLarge";
			state.value = "error";
			return;
		}

		revokePreview();
		selectedFile.value = file;
		previewUrl.value = URL.createObjectURL(file);
		result.value = null;
		errorKey.value = null;
		state.value = "image-selected";
	};

	const identify = async () => {
		if (state.value === "identifying" || !selectedFile.value) {
			return;
		}

		state.value = "identifying";
		errorKey.value = null;

		try {
			const file = selectedFile.value;
			const imageBase64 = await fileToBase64(file);
			result.value = await identifyMutation.mutateAsync({
				imageBase64,
				mimeType: file.type as (typeof ACCEPTED_MIME_TYPES)[number],
			});
			state.value = "identified";
		} catch (error) {
			errorKey.value = errorKeyFromORPCError(error);
			state.value = "error";
		}
	};

	const reset = () => {
		revokePreview();
		selectedFile.value = null;
		previewUrl.value = null;
		result.value = null;
		errorKey.value = null;
		state.value = "idle";
	};

	return {
		state: computed(() => state.value),
		previewUrl: computed(() => previewUrl.value),
		result: computed(() => result.value),
		error: computed(() => errorKey.value),
		isIdentifying: computed(() => state.value === "identifying"),
		selectImage,
		identify,
		reset,
	};
};
