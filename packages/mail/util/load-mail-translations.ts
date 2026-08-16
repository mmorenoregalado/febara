import type { MailMessages } from "@repo/i18n";
import { config, type Locale } from "@repo/i18n/config";
import { toMerged } from "es-toolkit";

import { mailTranslationsByLocale } from "./mail-translations-bundle";

export const getMailMessagesForLocale = async (locale: Locale): Promise<MailMessages> => {
	const localeMessages = mailTranslationsByLocale[locale];

	if (!localeMessages) {
		throw new Error(`Mail translation locale not found: ${locale}`);
	}

	if (locale === config.defaultLocale) {
		return localeMessages;
	}

	const defaultMessages = mailTranslationsByLocale[config.defaultLocale];

	if (!defaultMessages) {
		return localeMessages;
	}

	return toMerged(defaultMessages, localeMessages) as MailMessages;
};
