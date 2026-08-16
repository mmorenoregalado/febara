import { config, type Locale } from "../config";
import { mergeScopeAndShared, mergeWithDefaultLocale } from "./merge-locale-messages";

export type TranslationScope = "marketing" | "saas" | "mail";

async function importLocaleMessages<T>(
	locale: Locale,
	scope: TranslationScope | "shared",
): Promise<T> {
	return (await import(`../translations/${locale}/${scope}.json`)).default as T;
}

export async function getMessagesForLocale<T = Record<string, unknown>>(
	locale: Locale,
	scope: TranslationScope,
): Promise<T> {
	const localeMessages = await importLocaleMessages<T>(locale, scope);
	const sharedMessages = await importLocaleMessages<Record<string, unknown>>(locale, "shared");

	if (locale === config.defaultLocale) {
		return mergeScopeAndShared(localeMessages as Record<string, unknown>, sharedMessages);
	}

	const defaultLocaleMessages = await importLocaleMessages<T>(config.defaultLocale, scope);
	const defaultSharedMessages = await importLocaleMessages<Record<string, unknown>>(
		config.defaultLocale,
		"shared",
	);

	return mergeWithDefaultLocale(
		localeMessages as Record<string, unknown>,
		sharedMessages,
		defaultLocaleMessages as Record<string, unknown>,
		defaultSharedMessages,
	);
}
