<script setup lang="ts">
	import type { ActiveOrganization, OrganizationMemberRole } from "@repo/auth";
	import { canRemoveOrganizationMember } from "@repo/auth/lib/helper";

	import {
		activeOrganizationQueryKey,
		fullOrganizationQueryKey,
	} from "~/modules/organizations/lib/api";

	const { organizationId } = defineProps<{ organizationId: string }>();

	const { t } = useTranslations();
	const { user } = useSession();
	const toast = useToast();
	const authClient = useAuthClient();
	const queryClient = useQueryClient();
	const { activeOrganization } = useActiveOrganization();

	const { data: organization } = useFullOrganizationQuery(organizationId);

	const updateOrganizationCaches = (
		updater: (organization: ActiveOrganization) => ActiveOrganization,
	) => {
		queryClient.setQueryData(
			fullOrganizationQueryKey(organizationId),
			(current: ActiveOrganization | null | undefined) => (current ? updater(current) : current),
		);

		const slug = activeOrganization.value?.slug;

		if (activeOrganization.value?.id === organizationId && slug) {
			queryClient.setQueryData(
				activeOrganizationQueryKey(slug),
				(current: ActiveOrganization | null | undefined) => (current ? updater(current) : current),
			);
		}
	};

	const refreshOrganizationCaches = async () => {
		await queryClient.invalidateQueries({
			queryKey: fullOrganizationQueryKey(organizationId),
		});

		const slug = activeOrganization.value?.slug;

		if (activeOrganization.value?.id === organizationId && slug) {
			await queryClient.invalidateQueries({
				queryKey: activeOrganizationQueryKey(slug),
			});
		}
	};

	const handleUpdateRole = async ({
		membershipId,
		role,
	}: {
		membershipId: string;
		role: OrganizationMemberRole;
	}) => {
		const loadingToast = toast.add({
			color: "primary",
			description: t(
				"organizations.settings.members.notifications.updateMembership.loading.description",
			),
		});

		try {
			await authClient.organization.updateMemberRole({
				memberId: membershipId,
				role,
			});

			updateOrganizationCaches((current) => ({
				...current,
				members: current.members.map((member) =>
					member.id === membershipId ? { ...member, role } : member,
				),
			}));

			toast.update(loadingToast.id, {
				color: "success",
				description: t(
					"organizations.settings.members.notifications.updateMembership.success.description",
				),
			});

			await refreshOrganizationCaches();
		} catch (error) {
			toast.update(loadingToast.id, {
				color: "error",
				description: t(
					"organizations.settings.members.notifications.updateMembership.error.description",
				),
			});
		}
	};

	const handleRemoveMember = async ({ membershipId }: { membershipId: string }) => {
		const targetMember = members.value.find((member) => member.id === membershipId);

		if (!targetMember || !canRemoveMember(targetMember)) {
			return;
		}

		const loadingToast = toast.add({
			color: "primary",
			description: t(
				"organizations.settings.members.notifications.removeMember.loading.description",
			),
		});

		try {
			await authClient.organization.removeMember({
				memberIdOrEmail: membershipId,
			});

			updateOrganizationCaches((current) => ({
				...current,
				members: current.members.filter((member) => member.id !== membershipId),
			}));

			toast.update(loadingToast.id, {
				color: "success",
				description: t(
					"organizations.settings.members.notifications.removeMember.success.description",
				),
			});

			await refreshOrganizationCaches();
		} catch (error) {
			toast.update(loadingToast.id, {
				color: "error",
				description: t(
					"organizations.settings.members.notifications.removeMember.error.description",
				),
			});
		}
	};

	const members = computed(() => organization?.value?.members ?? []);

	const canRemoveMember = (targetMember: { userId: string; role: OrganizationMemberRole }) =>
		canRemoveOrganizationMember(organization.value, user.value, targetMember);

	interface PendingMemberRemoval {
		membershipId: string;
		memberName: string;
	}

	const pendingMemberRemoval = ref<PendingMemberRemoval | null>(null);
	const showRemoveMemberConfirmation = ref(false);
	const isRemoveMemberPending = ref(false);

	const openRemoveMemberConfirmation = ({ membershipId, memberName }: PendingMemberRemoval) => {
		const targetMember = members.value.find((member) => member.id === membershipId);

		if (!targetMember || !canRemoveMember(targetMember)) {
			return;
		}

		pendingMemberRemoval.value = { membershipId, memberName };
		showRemoveMemberConfirmation.value = true;
	};

	const closeRemoveMemberConfirmation = () => {
		showRemoveMemberConfirmation.value = false;
		pendingMemberRemoval.value = null;
	};

	const confirmRemoveMember = async () => {
		if (!pendingMemberRemoval.value) {
			return;
		}

		isRemoveMemberPending.value = true;

		try {
			await handleRemoveMember({ membershipId: pendingMemberRemoval.value.membershipId });
			closeRemoveMemberConfirmation();
		} finally {
			isRemoveMemberPending.value = false;
		}
	};
</script>

<template>
	<div class="rounded-md border">
		<UTable
			:data="members"
			:columns="[
				{
					accessorKey: 'user',
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
			<template #user-cell="{ row }">
				<div
					v-if="row.original.user.name && row.original.user.email"
					class="gap-2 flex items-center"
				>
					<UserAvatar
						:name="row.original.user.name"
						:avatarUrl="row.original.user.image"
						size="md"
					/>
					<div>
						<strong class="block">{{ row.original.user.name }}</strong>
						<small class="text-muted">
							{{ row.original.user.email }}
						</small>
					</div>
				</div>
			</template>

			<template #actions-cell="{ row }">
				<div class="gap-2 flex flex-row items-center justify-end">
					<OrganizationRoleSelect
						:modelValue="row.original.role"
						@update:modelValue="
							(val: OrganizationMemberRole) =>
								handleUpdateRole({ membershipId: row.original.id, role: val })
						"
						:disabled="row.original.role === 'owner'"
					/>

					<UDropdownMenu
						v-if="canRemoveMember(row.original)"
						:items="[
							{
								label: t('organizations.settings.members.removeMember'),
								icon: 'i-lucide-trash',
								color: 'error' as const,
								onClick: () =>
									openRemoveMemberConfirmation({
										membershipId: row.original.id,
										memberName: row.original.user.name ?? row.original.user.email ?? '',
									}),
							},
						]"
					>
						<UButton size="md" square variant="ghost">
							<UIcon name="i-lucide-more-vertical" class="size-4" />
						</UButton>
					</UDropdownMenu>
				</div>
			</template>

			<template #empty>
				<div class="h-24 text-center">No results.</div>
			</template>
		</UTable>
	</div>

	<UModal
		v-model:open="showRemoveMemberConfirmation"
		:title="t('organizations.settings.members.removeMember')"
		:description="
			pendingMemberRemoval
				? t('organizations.settings.members.removeMemberConfirmation', {
						memberName: pendingMemberRemoval.memberName,
					})
				: undefined
		"
	>
		<template #footer>
			<UButton
				variant="secondary"
				:disabled="isRemoveMemberPending"
				@click="closeRemoveMemberConfirmation"
			>
				{{ t("common.confirmation.cancel") }}
			</UButton>
			<UButton
				variant="solid"
				color="error"
				:loading="isRemoveMemberPending"
				@click="confirmRemoveMember"
			>
				{{ t("organizations.settings.members.removeMember") }}
			</UButton>
		</template>
	</UModal>
</template>
