<script setup lang="ts">
	import type { FormSubmitEvent } from "@nuxt/ui";
	import { z } from "zod";

	import { organizationListQueryKey } from "../lib/api";

	const { t } = useTranslations();
	const toast = useToast();
	const { setActiveOrganization } = useActiveOrganization();
	const queryClient = useQueryClient();

	const createOrganizationMutation = useCreateOrganizationMutation();

	const { defaultName } = defineProps<{
		defaultName?: string;
	}>();

	const schema = z.object({
		name: z.string().min(3).max(32),
	});

	type Schema = z.output<typeof schema>;

	const state = reactive<Schema>({
		name: defaultName || "",
	});

	const isSubmitting = ref(false);

	watch(
		() => defaultName,
		(newValue) => {
			if (newValue) {
				state.name = newValue;
			}
		},
	);

	const onSubmit = async (event: FormSubmitEvent<Schema>) => {
		isSubmitting.value = true;
		try {
			const newOrganization = await createOrganizationMutation.mutateAsync({
				name: event.data.name,
			});

			toast.add({
				title: t("organizations.createForm.notifications.success"),
			});

			await queryClient.invalidateQueries({ queryKey: organizationListQueryKey });
			await setActiveOrganization(newOrganization.slug);
		} catch (e) {
			toast.add({
				title: t("organizations.createForm.notifications.error"),
				color: "error",
			});
		} finally {
			isSubmitting.value = false;
		}
	};
</script>

<template>
	<h1 class="font-bold text-xl md:text-2xl">
		{{ $t("organizations.createForm.title") }}
	</h1>

	<p class="mt-2 mb-6 text-muted">
		{{ $t("organizations.createForm.subtitle") }}
	</p>

	<UForm :schema="schema" :state="state" @submit="onSubmit">
		<UFormField name="name" :label="$t('organizations.createForm.name')" class="w-full">
			<UInput v-model="state.name" autocomplete="company" class="w-full" />
		</UFormField>

		<UButton class="mt-4 w-full" type="submit" :loading="isSubmitting">
			{{ $t("organizations.createForm.submit") }}
		</UButton>
	</UForm>
</template>
