import { ORPCError } from "@orpc/client";
import type { ApiRouterOutputs } from "@repo/api/orpc/router";

type InsightsState = "idle" | "analyzing" | "success" | "error";
type InsightsResult = ApiRouterOutputs["ai"]["collectionInsights"];

function errorKeyFromORPCError(error: unknown): string {
	if (
		error instanceof ORPCError &&
		(error.code === "BAD_GATEWAY" || error.code === "GATEWAY_TIMEOUT")
	) {
		return "ai.collectionInsights.errors.unavailable";
	}
	return "ai.collectionInsights.errors.generic";
}

export const useCollectionInsights = () => {
	const { orpc } = useORPC();

	const state = ref<InsightsState>("idle");
	const result = ref<InsightsResult | null>(null);
	const errorKey = ref<string | null>(null);

	const insightsMutation = useMutation(orpc.ai.collectionInsights.mutationOptions());

	const analyze = async () => {
		if (state.value === "analyzing") {
			return;
		}

		state.value = "analyzing";
		errorKey.value = null;

		try {
			result.value = await insightsMutation.mutateAsync({});
			state.value = "success";
		} catch (error) {
			errorKey.value = errorKeyFromORPCError(error);
			state.value = "error";
		}
	};

	const reset = () => {
		result.value = null;
		errorKey.value = null;
		state.value = "idle";
	};

	return {
		state: computed(() => state.value),
		result: computed(() => result.value),
		error: computed(() => errorKey.value),
		isAnalyzing: computed(() => state.value === "analyzing"),
		analyze,
		reset,
	};
};
