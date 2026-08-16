import { config as i18nConfig } from "@repo/i18n/config";

export const useLocaleCurrency = () => {
	// oxlint-disable-next-line typescript/unbound-method
	const { locale, getNumberFormat } = useI18n();

	const localeCurrency = computed(() => {
		return (
			(getNumberFormat(locale.value)?.currency?.currency as string | null) ||
			i18nConfig.defaultCurrency
		);
	});

	return {
		localeCurrency,
	};
};
