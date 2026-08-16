<script setup lang="ts">
	import {
		activeOrganizationQueryKey,
		fullOrganizationQueryKey,
	} from "~/modules/organizations/lib/api";

	const { organizationId } = defineProps<{
		organizationId: string;
	}>();

	const { t } = useTranslations();
	const toast = useToast();
	const authClient = useAuthClient();
	const { activeOrganization } = useActiveOrganization();

	const queryClient = useQueryClient();
	const { data: organization } = useFullOrganizationQuery(organizationId);

	const invitations = computed(
		() =>
			organization.value?.invitations
				.filter((invitation) => invitation.status === "pending")
				.sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()) ?? [],
	);

	const handleRevokeInvitation = async ({ invitationId }: { invitationId: string }) => {
		const loadingToast = toast.add({
			color: "primary",
			description: t(
				"organizations.settings.members.notifications.revokeInvitation.loading.description",
			),
		});

		try {
			await authClient.organization.cancelInvitation({
				invitationId,
			});

			toast.update(loadingToast.id, {
				color: "success",
				description: t(
					"organizations.settings.members.notifications.revokeInvitation.success.description",
				),
			});

			await queryClient.invalidateQueries({
				queryKey: fullOrganizationQueryKey(organizationId),
			});

			if (activeOrganization.value?.slug) {
				await queryClient.invalidateQueries({
					queryKey: activeOrganizationQueryKey(activeOrganization.value.slug),
				});
			}
		} catch (error) {
			toast.update(loadingToast.id, {
				color: "error",
				description: t(
					"organizations.settings.members.notifications.revokeInvitation.error.description",
				),
			});
		}
	};
</script>

<template>
	<div class="rounded-md border">
		<UTable
			:data="invitations"
			:columns="[
				{
					accessorKey: 'email',
				},
				{
					accessorKey: 'actions',
				},
			]"
			:ui="{
				thead: 'hidden',
				td: 'py-2',
			}"
		>
			<template #email-cell="{ row }">
				<div>{{ row.original.email }}</div>
			</template>

			<template #actions-cell="{ row }">
				<div class="gap-2 flex flex-row justify-end">
					<OrganizationRoleSelect :modelValue="row.original.role" disabled />

					<UDropdownMenu
						:items="[
							{
								label: t('organizations.settings.members.invitations.revoke'),
								icon: 'i-lucide-undo',
								color: 'error' as const,
								onClick: () => handleRevokeInvitation({ invitationId: row.original.id }),
							},
						]"
					>
						<UButton size="sm" square variant="ghost">
							<UIcon name="i-lucide-more-vertical" class="size-4" />
						</UButton>
					</UDropdownMenu>
				</div>
			</template>

			<template #empty>
				<div class="text-center">
					{{ t("organizations.settings.members.invitations.empty") }}
				</div>
			</template>
		</UTable>
	</div>
</template>
