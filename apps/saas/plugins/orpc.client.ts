import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { ApiRouterClient } from "@repo/api/orpc/router";

export default defineNuxtPlugin(() => {
	const link = new RPCLink({
		url: `${window.location.origin}/api/rpc`,
		headers: () => ({}),
	});

	const orpcClient: ApiRouterClient = createORPCClient(link);

	return {
		provide: {
			orpcClient,
		},
	};
});
