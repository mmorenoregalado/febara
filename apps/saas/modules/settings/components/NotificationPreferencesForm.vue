<script setup lang="ts">
	import { NOTIFICATION_GROUPS, type NotificationTypeId } from "@repo/notifications/catalog";

	type TargetKey = "IN_APP" | "EMAIL";

	const { t } = useTranslations();
	const { orpc } = useORPC();
	const queryClient = useQueryClient();

	const preferencesQuery = useQuery(
		orpc.notifications.getPreferences.queryOptions({
			input: {},
		}),
	);

	const disabledSet = computed(() => {
		const set = new Set<string>();
		for (const row of preferencesQuery.data.value?.disabled ?? []) {
			set.add(`${row.type}:${row.target}`);
		}
		return set;
	});

	const updateMutation = useMutation({
		...orpc.notifications.updatePreference.mutationOptions(),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: orpc.notifications.getPreferences.queryKey({ input: {} }),
			});
		},
	});

	const isEnabled = (type: string, target: TargetKey) =>
		!disabledSet.value.has(`${type}:${target}`);

	const onToggle = (type: NotificationTypeId, target: TargetKey, nextEnabled: boolean) => {
		updateMutation.mutate({
			type,
			target,
			disabled: !nextEnabled,
		});
	};
</script>

<template>
	<SettingsItem
		:title="$t('settings.notificationsPage.title')"
		:description="$t('settings.notificationsPage.description')"
	>
		<div v-if="preferencesQuery.isPending.value" class="gap-2 grid grid-cols-1">
			<USkeleton class="h-8 w-full" />
			<USkeleton class="h-24 w-full" />
		</div>
		<div v-else class="gap-8 flex flex-col">
			<section v-for="group in NOTIFICATION_GROUPS" :key="group.id">
				<h3 class="mb-3 font-medium text-highlighted text-sm">
					{{ t(`settings.notificationsPage.groups.${group.id}.title`) }}
				</h3>
				<div class="rounded-lg border-default overflow-x-auto border">
					<table class="text-sm w-full min-w-[320px]">
						<thead>
							<tr class="border-default bg-muted border-b text-left">
								<th class="px-3 py-2 font-medium">
									{{ t("settings.notificationsPage.columns.type") }}
								</th>
								<th class="px-3 py-2 font-medium">
									{{ t("settings.notificationsPage.columns.inApp") }}
								</th>
								<th class="px-3 py-2 font-medium">
									{{ t("settings.notificationsPage.columns.email") }}
								</th>
							</tr>
						</thead>
						<tbody>
							<tr
								v-for="type in group.types"
								:key="type"
								class="border-default border-b last:border-0"
							>
								<td class="px-3 py-3 font-medium">
									{{ t(`settings.notificationsPage.types.${type}.label`) }}
								</td>
								<td class="px-3 py-2">
									<USwitch
										:model-value="isEnabled(type, 'IN_APP')"
										:disabled="updateMutation.isPending.value"
										:aria-label="`${type} in-app`"
										@update:model-value="(checked) => onToggle(type, 'IN_APP', checked)"
									/>
								</td>
								<td class="px-3 py-2">
									<USwitch
										:model-value="isEnabled(type, 'EMAIL')"
										:disabled="updateMutation.isPending.value"
										:aria-label="`${type} email`"
										@update:model-value="(checked) => onToggle(type, 'EMAIL', checked)"
									/>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</section>
		</div>
	</SettingsItem>
</template>
