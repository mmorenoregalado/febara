import { getBaseUrl } from "@repo/utils";

export const config = {
	saasUrl: getBaseUrl(process.env.NUXT_PUBLIC_SAAS_URL),
} as const;
