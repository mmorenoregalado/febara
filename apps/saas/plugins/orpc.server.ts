import { createRouterClient } from "@orpc/server";
import { router } from "@repo/api/orpc/router";

export default defineNuxtPlugin(() => {
	const event = useRequestEvent();

	const orpcClient = createRouterClient(router, {
		context: {
			headers: event?.headers ?? new Headers(),
		},
	});

	return {
		provide: {
			orpcClient,
		},
	};
});
