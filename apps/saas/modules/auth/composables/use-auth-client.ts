import { passkeyClient } from "@better-auth/passkey/client";
import type { auth } from "@repo/auth";
import {
	adminClient,
	inferAdditionalFields,
	magicLinkClient,
	organizationClient,
	twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/vue";

export const useAuthClient = () => {
	const url = useRequestURL();
	const headers = import.meta.server ? useRequestHeaders() : undefined;

	const authClient = createAuthClient({
		baseURL: `${url.origin}/api/auth`,
		plugins: [
			inferAdditionalFields<typeof auth>(),
			magicLinkClient(),
			organizationClient(),
			adminClient(),
			passkeyClient(),
			twoFactorClient(),
		],
		fetchOptions: {
			throw: true,
			headers,
		},
	});

	return authClient;
};

export type AuthClientErrorCodes = ReturnType<typeof useAuthClient>["$ERROR_CODES"] & {
	INVALID_INVITATION: string;
};
