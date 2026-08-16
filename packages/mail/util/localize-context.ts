import type { MailMessages } from "@repo/i18n";

import { mailTemplates } from "./templates";

export type MailTemplateId = keyof typeof mailTemplates;

type MailTemplateTranslationKey = Exclude<keyof MailMessages, "common">;

const isMailTemplateTranslationKey = (
	key: string,
	translations: MailMessages,
): key is MailTemplateTranslationKey => key !== "common" && key in translations;

const bodyToHtml = (body: string) => body.replace(/\n/g, "<br />");

const interpolate = (template: string, vars: Record<string, string>) =>
	template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? `{${key}}`);

const stringTranslationValues = (values: Record<string, unknown>) => {
	const strings: Record<string, string> = {};

	for (const [key, value] of Object.entries(values)) {
		if (typeof value === "string") {
			strings[key] = value;
		}
	}

	return strings;
};

const localizeStringValues = (values: Record<string, unknown>, vars: Record<string, string>) => {
	const localized: Record<string, string> = {};

	for (const [key, value] of Object.entries(values)) {
		if (typeof value === "string") {
			localized[key] = interpolate(value, vars);
		}
	}

	return localized;
};

const templateTranslationsFor = (translations: MailMessages, templateId: MailTemplateId) => {
	if (!isMailTemplateTranslationKey(templateId, translations)) {
		throw new Error(`No mail translations for template: ${String(templateId)}`);
	}

	return stringTranslationValues(translations[templateId] as Record<string, unknown>);
};

export type LocalizedMailContent = {
	subject: string;
	context: Record<string, unknown>;
};

export const buildLocalizedMailContent = (
	templateId: MailTemplateId,
	translations: MailMessages,
	context: Record<string, unknown>,
): LocalizedMailContent => {
	const vars = stringTranslationValues(context);
	const templateMessages = templateTranslationsFor(translations, templateId);
	const localized = localizeStringValues(
		{
			...stringTranslationValues(translations.common as Record<string, unknown>),
			...templateMessages,
		},
		vars,
	);

	const subject = localized.subject ?? mailTemplates[templateId].subject ?? "Notification";

	const { subject: _subject, body, ...templateContext } = localized;
	const renderContext: Record<string, unknown> = {
		...templateContext,
	};

	if (body) {
		renderContext.bodyHtml = bodyToHtml(body);
	}

	return {
		subject,
		context: renderContext,
	};
};
