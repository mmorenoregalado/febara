/**
 * Format a date.
 * Uses the values defined in `i18n.config.ts`
 */
export const useLocaleDate = () => {
	const { locale } = useI18n();

	const isValidDate = (date: Date | null | undefined): date is Date =>
		date instanceof Date && !Number.isNaN(date.getTime());

	const formatDate = ({ date }: { date: Date | null | undefined }) => {
		if (!isValidDate(date)) {
			return "";
		}
		return new Intl.DateTimeFormat(locale.value).format(date);
	};

	const formatDateTime = ({ date }: { date: Date | null | undefined }) => {
		if (!isValidDate(date)) {
			return "";
		}
		return new Intl.DateTimeFormat(locale.value, {
			dateStyle: "medium",
			timeStyle: "short",
		}).format(date);
	};

	return {
		formatDate,
		formatDateTime,
	};
};
