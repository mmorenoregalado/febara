<script setup lang="ts">
	import type { DropdownMenuItem } from "@nuxt/ui";
	import type { LocaleObject } from "@nuxtjs/i18n";

	const { locales, locale, setLocale } = useI18n();
	const { t } = useTranslations();

	const localeModel = computed({
		get: () => locale.value,
		set: (nextLocale) => setLocale(nextLocale),
	});

	const menuItems = computed(() =>
		(locales.value as LocaleObject[]).map(
			(localeObj): DropdownMenuItem => ({
				label: localeObj.name,
				type: "checkbox" as const,
				checked: localeModel.value === localeObj.code,
				onUpdateChecked: (checked: boolean) => {
					if (checked) localeModel.value = localeObj.code;
				},
			}),
		),
	);
</script>

<template>
	<UDropdownMenu v-if="locales.length > 1" :items="menuItems">
		<UButton variant="ghost" size="icon" square :aria-label="t('common.aria.language')">
			<UIcon name="i-lucide-languages" class="size-4" />
		</UButton>
	</UDropdownMenu>
</template>
