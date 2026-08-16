<script setup lang="ts">
	import type { FormSubmitEvent } from "@nuxt/ui";
	import { z } from "zod";

	const { activeOrganization, refetchActiveOrganization } = useActiveOrganization();

	const { t } = useTranslations();
	const authClient = useAuthClient();
	const toast = useToast();
	const queryClient = useQueryClient();

	const schema = z.object({
		name: z.string().min(3),
	});

	type Schema = z.output<typeof schema>;

	const state = reactive<Schema>({
		name: activeOrganization.value?.name || "",
	});

	const isSubmitting = ref(false);
	const isDirty = computed(() => state.name !== (activeOrganization.value?.name || ""));

	watch(
		() => activeOrganization.value?.name,
		(newValue) => {
			if (newValue) {
				state.name = newValue;
			}
		},
	);

	const onSubmit = async (event: FormSubmitEvent<Schema>) => {
		if (!activeOrganization.value) {
			return;
		}

		isSubmitting.value = true;
		try {
			await authClient.organization.update({
				organizationId: activeOrganization.value?.id,
				data: {
					name: event.data.name,
				},
			});

			toast.add({
				color: "success",
				title: t("organizations.settings.notifications.organizationNameUpdated"),
			});

			refetchActiveOrganization();
			queryClient.invalidateQueries({
				queryKey: organizationListQueryKey,
			});
		} catch (error) {
			toast.add({
				color: "error",
				title: t("organizations.settings.notifications.organizationNameNotUpdated"),
			});
		} finally {
			isSubmitting.value = false;
		}
	};
</script>

<template>
	<SettingsItem :title="$t('organizations.settings.changeName.title')">
		<UForm :schema="schema" :state="state" @submit="onSubmit">
			<div>
				<UFormField name="name">
					<UInput v-model="state.name" type="text" required autocomplete="name" class="w-full" />
				</UFormField>
			</div>

			<div class="mt-4 flex justify-end">
				<UButton type="submit" :disabled="!isDirty" :loading="isSubmitting">
					{{ $t("settings.save") }}
				</UButton>
			</div>
		</UForm>
	</SettingsItem>
</template>
