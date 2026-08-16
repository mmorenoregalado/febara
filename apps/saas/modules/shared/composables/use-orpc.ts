import { createTanstackQueryUtils } from "@orpc/tanstack-query";

export const useORPC = () => {
	const orpcClient = useNuxtApp().$orpcClient;

	const orpc = createTanstackQueryUtils(orpcClient);

	return {
		orpc,
	};
};
