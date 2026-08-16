/**
 * Returns the base URL for the current app. Pass the env value directly so Nuxt
 * can replace it at build time (e.g. process.env.NUXT_PUBLIC_SAAS_URL).
 *
 * @param envValue - The env value to use when defined (e.g. process.env.NUXT_PUBLIC_SAAS_URL)
 * @param defaultPort - Port for localhost fallback when no env is set (default: 3000)
 */
export function getBaseUrl(envValue?: string, defaultPort = 3000): string {
	if (envValue) {
		return envValue;
	}
	if (process.env.NUXT_PUBLIC_VERCEL_URL) {
		return `https://${process.env.NUXT_PUBLIC_VERCEL_URL}`;
	}
	return `http://localhost:${process.env.PORT ?? defaultPort}`;
}
