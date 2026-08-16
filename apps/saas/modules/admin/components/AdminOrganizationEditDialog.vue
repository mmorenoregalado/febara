<script lang="ts" setup>
	import type { FormSubmitEvent } from "@nuxt/ui";
	import type { ApiRouterOutputs } from "@repo/api/orpc/router";
	import { z } from "zod";

	type AdminOrganizationRow =
		ApiRouterOutputs["admin"]["organizations"]["list"]["organizations"][number];

	const props = defineProps<{
		open: boolean;
		organization: AdminOrganizationRow;
	}>();

	const emit = defineEmits<{
		"update:open": [open: boolean];
		saved: [];
	}>();

	const { t } = useTranslations();
	const toast = useToast();
	const { orpc } = useORPC();

	const schema = z.object({
		name: z.string().trim().min(3),
	});

	type Schema = z.output<typeof schema>;

	const getInitialState = (organization: AdminOrganizationRow): Schema => ({
		name: organization.name,
	});

	const state = reactive<Schema>(getInitialState(props.organization));
	const isSubmitting = ref(false);

	const localOpen = computed({
		get: () => props.open,
		set: (value: boolean) => emit("update:open", value),
	});

	const closeDialog = () => {
		localOpen.value = false;
	};

	const initialState = computed(() => getInitialState(props.organization));
	const isDirty = computed(() => state.name !== initialState.value.name);

	watch(
		() => props.organization,
		(organization) => {
			Object.assign(state, getInitialState(organization));
		},
	);

	watch(localOpen, (open) => {
		if (open) {
			Object.assign(state, getInitialState(props.organization));
		}
	});

	const updateOrganizationMutation = useMutation(orpc.admin.organizations.update.mutationOptions());

	const onSubmit = async (event: FormSubmitEvent<Schema>) => {
		isSubmitting.value = true;

		try {
			await updateOrganizationMutation.mutateAsync({
				id: props.organization.id,
				name: event.data.name,
			});

			toast.add({
				color: "success",
				title: t("admin.organizations.form.notifications.success"),
			});

			emit("saved");
			localOpen.value = false;
		} catch {
			toast.add({
				color: "error",
				title: t("admin.organizations.form.notifications.error"),
			});
		} finally {
			isSubmitting.value = false;
		}
	};
</script>

<template>
	<UModal
		v-model:open="localOpen"
		:title="t('admin.organizations.form.updateTitle')"
		:description="organization.id"
	>
		<template #body>
			<UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
				<UFormField name="name" :label="t('admin.organizations.form.name')" required>
					<UInput v-model="state.name" autocomplete="organization" class="w-full" />
				</UFormField>

				<div class="gap-2 flex justify-end">
					<UButton variant="outline" type="button" @click="closeDialog">
						{{ $t("common.confirmation.cancel") }}
					</UButton>
					<UButton type="submit" :disabled="!isDirty" :loading="isSubmitting">
						{{ t("admin.organizations.form.save") }}
					</UButton>
				</div>
			</UForm>
		</template>
	</UModal>
</template>
