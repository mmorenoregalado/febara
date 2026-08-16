<script setup lang="ts">
	interface NotificationRow {
		id: string;
		type: string;
		data: unknown;
		link: string | null;
		read: boolean;
		createdAt: Date | string;
	}

	const TYPE_ICONS: Record<string, string> = {
		WELCOME: "i-lucide-party-popper",
		APP_UPDATE: "i-lucide-sparkles",
		system: "i-lucide-info",
		announcement: "i-lucide-info",
	};

	const { t } = useTranslations();
	const { user } = useSession();
	const { orpc } = useORPC();
	const { formatDateTime } = useLocaleDate();
	const queryClient = useQueryClient();
	const open = ref(false);

	const unreadCountQuery = useQuery({
		...orpc.notifications.unreadCount.queryOptions({ input: {} }),
		enabled: computed(() => Boolean(user.value)),
		refetchOnWindowFocus: true,
	});

	const notificationListQuery = useQuery({
		...orpc.notifications.list.queryOptions({ input: {} }),
		enabled: computed(() => Boolean(user.value) && open.value),
	});

	const notifications = computed<NotificationRow[]>(() => notificationListQuery.data.value ?? []);
	const unreadCount = computed(() => unreadCountQuery.data.value?.count ?? 0);

	const notificationIcon = (type: string) => TYPE_ICONS[type] ?? "i-lucide-bell";

	const notificationDateTime = (createdAt: Date | string) => {
		const date = createdAt instanceof Date ? createdAt : new Date(createdAt);
		return formatDateTime({ date });
	};

	const notificationPayload = (data: unknown) => {
		if (data && typeof data === "object" && !Array.isArray(data)) {
			return data as { title?: string; message?: string };
		}
		return {};
	};

	const invalidateNotificationQueries = async () => {
		await queryClient.invalidateQueries({
			queryKey: orpc.notifications.unreadCount.queryKey({ input: {} }),
		});
		await queryClient.invalidateQueries({
			queryKey: orpc.notifications.list.queryKey({ input: {} }),
		});
	};

	const markNotificationsReadMutation = useMutation({
		...orpc.notifications.markRead.mutationOptions(),
		onSuccess: invalidateNotificationQueries,
	});

	const markAllReadMutation = useMutation({
		...orpc.notifications.markAllRead.mutationOptions(),
		onSuccess: invalidateNotificationQueries,
	});

	watch(
		[open, notifications],
		([isOpen, rows]) => {
			if (!isOpen || rows.length === 0) {
				return;
			}
			const ids = rows
				.filter((notification) => !notification.read)
				.map((notification) => notification.id);
			if (ids.length > 0) {
				markNotificationsReadMutation.mutate({ ids });
			}
		},
		{ flush: "post" },
	);
</script>

<template>
	<UPopover v-if="user" v-model:open="open" :content="{ align: 'end' }">
		<UButton
			type="button"
			variant="outline"
			size="icon"
			class="relative shrink-0"
			:aria-label="t('app.notifications.aria.open')"
		>
			<UIcon name="i-lucide-bell" class="size-4 text-muted" />
			<span
				v-if="unreadCount > 0"
				class="-right-1.5 -top-1.5 h-5 min-w-5 px-1 font-semibold absolute flex items-center justify-center rounded-full bg-touch text-[10px] leading-none text-touch-foreground"
			>
				{{ unreadCount > 99 ? "99+" : unreadCount }}
			</span>
		</UButton>

		<template #content>
			<div class="w-[min(100vw-2rem,22rem)]">
				<div class="gap-2 border-default px-3 py-2 flex items-center justify-between border-b">
					<h2 class="font-semibold text-sm">{{ t("app.notifications.title") }}</h2>
					<UButton
						type="button"
						variant="ghost"
						size="sm"
						class="h-8 text-xs shrink-0"
						:disabled="
							notifications.length === 0 ||
							!notifications.some((notification) => !notification.read) ||
							markAllReadMutation.isPending.value
						"
						@click="markAllReadMutation.mutate({})"
					>
						{{ t("app.notifications.markAllRead") }}
					</UButton>
				</div>
				<div class="max-h-80 px-1 py-2 overflow-y-auto">
					<p v-if="notifications.length === 0" class="px-3 py-6 text-muted text-sm text-center">
						{{ t("app.notifications.empty") }}
					</p>
					<ul v-else class="gap-1 flex flex-col">
						<li v-for="notification in notifications" :key="notification.id">
							<a
								v-if="notification.link"
								:href="notification.link"
								class="rounded-lg focus-visible:ring-primary block outline-none focus-visible:ring-2"
								@click="open = false"
							>
								<div
									:class="
										cn('gap-3 rounded-lg px-2 py-2 text-sm flex', {
											'bg-accented/40': !notification.read,
										})
									"
								>
									<UIcon
										:name="notificationIcon(notification.type)"
										class="mt-0.5 size-4 text-primary shrink-0"
									/>
									<div class="min-w-0 flex-1">
										<p class="font-medium leading-snug">
											{{
												notificationPayload(notification.data).title ||
												notification.type ||
												t("app.notifications.fallbackTitle")
											}}
										</p>
										<p
											v-if="notificationPayload(notification.data).message"
											class="mt-0.5 text-muted text-xs leading-snug"
										>
											{{ notificationPayload(notification.data).message }}
										</p>
										<p class="mt-1 text-dimmed leading-snug text-[11px]">
											{{ notificationDateTime(notification.createdAt) }}
										</p>
									</div>
								</div>
							</a>
							<div
								v-else
								:class="
									cn('gap-3 rounded-lg px-2 py-2 text-sm flex', {
										'bg-accented/40': !notification.read,
									})
								"
							>
								<UIcon
									:name="notificationIcon(notification.type)"
									class="mt-0.5 size-4 text-primary shrink-0"
								/>
								<div class="min-w-0 flex-1">
									<p class="font-medium leading-snug">
										{{
											notificationPayload(notification.data).title ||
											notification.type ||
											t("app.notifications.fallbackTitle")
										}}
									</p>
									<p
										v-if="notificationPayload(notification.data).message"
										class="mt-0.5 text-muted text-xs leading-snug"
									>
										{{ notificationPayload(notification.data).message }}
									</p>
									<p class="mt-1 text-dimmed leading-snug text-[11px]">
										{{ notificationDateTime(notification.createdAt) }}
									</p>
								</div>
							</div>
						</li>
					</ul>
				</div>
			</div>
		</template>
	</UPopover>
</template>
