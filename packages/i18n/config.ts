import type { I18nConfig } from "./types";

export const config = {
	locales: {
		es: {
			label: "Español",
			currency: "USD",
		},
		en: {
			label: "English",
			currency: "USD",
		},
	},
	defaultLocale: "es",
	defaultCurrency: "USD",
	localeCookieName: "NUXT_LOCALE",
} as const satisfies I18nConfig;

export type Locale = keyof typeof config.locales;
