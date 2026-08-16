<script setup lang="ts">
	import type { FormSubmitEvent } from "@nuxt/ui";
	import { z } from "zod";

	import { activeOrganizationQueryKey, fullOrganizationQueryKey } from "../lib/api";

	const authClient = useAuthClient();
	const queryClient = useQueryClient();

	const { organizationId } = defineProps<{
		organizationId: string;
	}>();

	const emit = defineEmits<{
		success: [];
	}>();

	const { t } = useTranslations();
	const toast = useToast();
	const { activeOrganization, activeOrganizationUserRole } = useActiveOrganization();

	const roleValues = ["owner", "member", "admin"] as const;

	const schema = z.object({
		email: z.email(),
		role: z.enum(roleValues),
	});

	type Schema = z.output<typeof schema>;

	const state = reactive<Schema>({
		email: "",
		role: "member",
	});

	const initialState = { email: "", role: "member" as const };
	const isSubmitting = ref(false);
	const isDirty = computed(
		() => state.email !== initialState.email || state.role !== initialState.role,
	);

	const onSubmit = async (event: FormSubmitEvent<Schema>) => {
		isSubmitting.value = true;
		try {
			await authClient.organization.inviteMember({
				organizationId,
				email: event.data.email,
				role: event.data.role,
			});

			await queryClient.invalidateQueries({
				queryKey: fullOrganizationQueryKey(organizationId),
			});

			if (activeOrganization.value?.slug) {
				await queryClient.invalidateQueries({
					queryKey: activeOrganizationQueryKey(activeOrganization.value.slug),
				});
			}

			state.email = "";
			state.role = "member";

			toast.add({
				title: t("organizations.settings.members.inviteMember.notifications.success.title"),
				description: t(
					"organizations.settings.members.inviteMember.notifications.success.description",
				),
				color: "success",
			});
			emit("success");
		} catch (error) {
			toast.add({
				title: t("organizations.settings.members.inviteMember.notifications.error.title"),
				description: t(
					"organizations.settings.members.inviteMember.notifications.error.description",
				),
				color: "error",
			});
		} finally {
			isSubmitting.value = false;
		}
	};
</script>

<template>
	<SettingsItem
		:title="$t('organizations.settings.members.inviteMember.title')"
		:description="$t('organizations.settings.members.inviteMember.description')"
		v-if="activeOrganizationUserRole === 'owner'"
	>
		<UForm :schema="schema" :state="state" @submit="onSubmit" class="@container">
			<div class="gap-2 @md:flex-row flex flex-col">
				<UFormField
					name="email"
					:label="$t('organizations.settings.members.inviteMember.email')"
					class="flex-1"
				>
					<UInput v-model="state.email" autocomplete="email" class="w-full" />
				</UFormField>

				<UFormField name="role" :label="$t('organizations.settings.members.inviteMember.role')">
					<OrganizationRoleSelect v-model="state.role" class="w-full" />
				</UFormField>
			</div>

			<div class="mt-4 flex justify-end">
				<UButton type="submit" :disabled="!isDirty" :loading="isSubmitting">
					{{ $t("organizations.settings.members.inviteMember.submit") }}
				</UButton>
			</div>
		</UForm>
	</SettingsItem>
</template>
