import {
	getUserEmailLocaleForNotifications,
	insertNotification,
	isNotificationDisabled,
	type NotificationTarget,
	type NotificationType,
} from "@repo/database";
import { type Locale, config as i18nConfig } from "@repo/i18n";
import { sendEmail } from "@repo/mail";

import { resolveNotificationLink } from "./resolve-link";
import { NOTIFICATION_TYPES } from "./types";

/** Example / onboarding notifications — never emailed. */
const IN_APP_ONLY_NOTIFICATION_TYPES = new Set<string>([NOTIFICATION_TYPES.WELCOME]);

const isLocale = (value: string | null | undefined): value is Locale =>
	Boolean(value && value in i18nConfig.locales);

const notificationDataFromUnknown = (data: unknown) => {
	if (data && typeof data === "object" && !Array.isArray(data)) {
		return data as Record<string, unknown>;
	}
	return {};
};

export async function createNotification(input: {
	userId: string;
	type: NotificationType;
	data?: unknown;
	link?: string | null;
	read?: boolean;
}) {
	const inAppDisabled = await isNotificationDisabled(
		input.userId,
		input.type,
		"IN_APP" as NotificationTarget,
	);

	const emailDisabled = await isNotificationDisabled(
		input.userId,
		input.type,
		"EMAIL" as NotificationTarget,
	);

	const absoluteLink = resolveNotificationLink(input.link);
	let created: Awaited<ReturnType<typeof insertNotification>> | null = null;

	if (!inAppDisabled) {
		created = await insertNotification({
			userId: input.userId,
			type: input.type,
			data: input.data ?? {},
			link: absoluteLink,
			read: input.read ?? false,
		});
	}

	if (!emailDisabled && !IN_APP_ONLY_NOTIFICATION_TYPES.has(input.type)) {
		const userRow = await getUserEmailLocaleForNotifications(input.userId);

		if (userRow?.email) {
			const locale = isLocale(userRow.locale) ? userRow.locale : i18nConfig.defaultLocale;
			const dataObj = notificationDataFromUnknown(input.data);
			const title =
				typeof dataObj.headline === "string" && dataObj.headline.length > 0
					? dataObj.headline
					: typeof dataObj.title === "string" && dataObj.title.length > 0
						? dataObj.title
						: String(input.type);
			const message = typeof dataObj.message === "string" ? dataObj.message : undefined;

			await sendEmail({
				to: userRow.email,
				locale,
				templateId: "notification",
				context: {
					title,
					message,
					link: absoluteLink ?? undefined,
				},
			});
		}
	}

	return created;
}
