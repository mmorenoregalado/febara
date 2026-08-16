<script lang="ts" setup>
	import type { ApiRouterOutputs } from "@repo/api/orpc/router";

	import { organizationListQueryKey } from "~/modules/organizations/lib/api";

	import AdminOrganizationEditDialog from "./AdminOrganizationEditDialog.vue";

	type AdminOrganizationRow =
		ApiRouterOutputs["admin"]["organizations"]["list"]["organizations"][number];

	defineProps<{
		organization: AdminOrganizationRow;
	}>();

	const queryClient = useQueryClient();
	const { orpc } = useORPC();
	const isEditDialogOpen = ref(false);

	const openEditDialog = () => {
		isEditDialogOpen.value = true;
	};

	const onOrganizationSaved = async () => {
		await Promise.all([
			queryClient.invalidateQueries({
				queryKey: orpc.admin.organizations.list.key(),
			}),
			queryClient.invalidateQueries({
				queryKey: organizationListQueryKey,
			}),
		]);
	};
</script>

<template>
	<div class="gap-2 flex flex-row justify-end">
		<UButton
			size="sm"
			square
			variant="ghost"
			:aria-label="$t('admin.organizations.edit')"
			@click="openEditDialog"
		>
			<UIcon name="i-lucide-pencil" class="size-4" />
		</UButton>
	</div>
	<AdminOrganizationEditDialog
		v-model:open="isEditDialogOpen"
		:organization="organization"
		@saved="onOrganizationSaved"
	/>
</template>
