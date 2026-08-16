/** Section id for i18n (`settings.notificationsPage.groups.${id}`) and ordering. */
export type NotificationGroupId = "general";

/** Mirrors Prisma `NotificationType`; keep in sync with the database schema. */
export type NotificationTypeId = "WELCOME" | "APP_UPDATE";

export interface NotificationGroupConfig {
	id: NotificationGroupId;
	/** Notification types in this section, in display order. */
	types: readonly NotificationTypeId[];
}

export const NOTIFICATION_GROUPS: readonly NotificationGroupConfig[] = [
	{
		id: "general",
		types: ["APP_UPDATE"],
	},
];
