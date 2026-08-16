<script setup lang="ts">
	import type { Locale } from "@repo/i18n";
	import { config as i18nConfig } from "@repo/i18n/config";

	const { t } = useTranslations();
	const toast = useToast();
	const { locale: currentLocale, setLocale } = useI18n();
	const { reloadSession } = useSession();
	const authClient = useAuthClient();

	const locale = ref<Locale | undefined>(currentLocale.value as Locale);
	const isSubmitting = ref(false);

	// Watch for changes in current locale from i18n
	watch(currentLocale, (newLocale) => {
		locale.value = newLocale as Locale;
	});

	const saveLocale = async (newLocale: Locale) => {
		if (!newLocale) {
			return;
		}

		isSubmitting.value = true;
		try {
			await authClient.updateUser({
				locale: newLocale,
			});

			await setLocale(newLocale);
			await reloadSession();

			toast.add({
				color: "success",
				title: t("settings.account.language.notifications.success"),
			});
		} catch {
			toast.add({
				color: "error",
				title: t("settings.account.language.notifications.error"),
			});
		} finally {
			isSubmitting.value = false;
		}
	};

	const localeOptions = computed(() =>
		Object.entries(i18nConfig.locales).map(([key, value]) => ({
			label: value.label,
			value: key as Locale,
		})),
	);

	const localeModel = computed({
		get: () => locale.value,
		set: (value: Locale | undefined) => {
			if (value) {
				locale.value = value;
				saveLocale(value);
			}
		},
	});
</script>

<template>
	<SettingsItem
		:title="$t('settings.account.language.title')"
		:description="$t('settings.account.language.description')"
	>
		<USelect v-model="localeModel" :items="localeOptions" :disabled="isSubmitting" class="w-full" />
	</SettingsItem>
</template>
