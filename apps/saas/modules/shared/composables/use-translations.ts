// Import default locale
import type { SaasMessages } from "@repo/i18n";

import { useI18n } from "#imports";

/**
 * This is the equivalent of `useI18n`, execpt it adds types for the translation keys.
 */
export const useTranslations = () => {
	return useI18n<[SaasMessages]>();
};
