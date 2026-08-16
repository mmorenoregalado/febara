import type { MailMessages } from "@repo/i18n";
import type { Locale } from "@repo/i18n/config";

import enMail from "../../i18n/translations/en/mail.json";
import esMail from "../../i18n/translations/es/mail.json";

export const mailTranslationsByLocale: Record<Locale, MailMessages> = {
	en: enMail,
	es: esMail,
};
