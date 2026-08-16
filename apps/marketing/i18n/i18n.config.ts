import { config as i18nConfig } from "@repo/i18n/config";

export default defineI18nConfig(() => ({
	legacy: false,
	availableLocales: Object.keys(i18nConfig.locales) as (keyof typeof i18nConfig.locales)[],
	locale: i18nConfig.defaultLocale,
	fallbackLocale: i18nConfig.defaultLocale,
	// @ts-expect-error
	numberFormats: Object.fromEntries(
		Object.entries(i18nConfig.locales).map(([locale]) => [
			locale,
			{
				number: {
					style: "decimal",
				},
				currency: {
					style: "currency",
					currency: "USD",
					notation: "standard",
					minimumFractionDigits: 0,
				},
				percent: {
					style: "percent",
					useGrouping: false,
					maximumFractionDigits: 2,
				},
			},
		]),
	),
}));
