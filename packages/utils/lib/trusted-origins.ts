import { getBaseUrl } from "./base-url";

/**
 * Normalizes a list of URLs into an explicit allowlist of trusted origins.
 *
 * Each input value is reduced to its origin (scheme + host + port); empty,
 * nullish, or invalid values (including a `"*"` wildcard) are dropped, and
 * duplicates are removed.
 *
 * This list is consumed both by Better Auth's `trustedOrigins` (which also
 * validates callback/redirect URLs such as the magic-link `callbackURL`) and by
 * the API CORS configuration, so it must only ever contain the application's
 * own configured origins. A wildcard would turn auth callbacks into an open
 * redirect.
 */
export const buildTrustedOrigins = (values: (string | undefined | null)[]): string[] => {
	const origins = values
		.map((value) => {
			if (!value) {
				return null;
			}
			try {
				return new URL(value).origin;
			} catch {
				return null;
			}
		})
		.filter((origin): origin is string => origin !== null);

	return Array.from(new Set(origins));
};

/**
 * Resolves the application's trusted origins from the configured public app
 * URLs (SaaS, site, and marketing), falling back to the resolved base URL for
 * the SaaS app. Shared by the auth and API packages so both validate against
 * the same allowlist.
 */
export const getTrustedOrigins = (): string[] =>
	buildTrustedOrigins([
		getBaseUrl(process.env.NUXT_PUBLIC_SAAS_URL),
		process.env.NUXT_PUBLIC_SAAS_URL,
		process.env.NUXT_PUBLIC_SITE_URL,
		process.env.NUXT_PUBLIC_MARKETING_URL,
	]);
