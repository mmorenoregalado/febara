<script setup lang="ts">
	import type { FormSubmitEvent } from "@nuxt/ui";
	import { z } from "zod";

	const { t } = useTranslations();
	const toast = useToast();
	const { user, reloadSession } = useSession();
	const authClient = useAuthClient();

	const schema = z.object({
		email: z.email(),
	});

	type Schema = z.output<typeof schema>;

	const state = reactive<Schema>({
		email: user.value?.email ?? "",
	});

	const initialEmail = computed(() => user.value?.email ?? "");
	const isSubmitting = ref(false);
	const isDirty = computed(() => state.email !== initialEmail.value);

	watch(
		() => user.value?.email,
		(newEmail) => {
			if (newEmail) {
				state.email = newEmail;
			}
		},
	);

	const onSubmit = async (event: FormSubmitEvent<Schema>) => {
		isSubmitting.value = true;
		try {
			await authClient.changeEmail({
				newEmail: event.data.email,
			});

			toast.add({
				color: "success",
				title: t("settings.account.changeEmail.notifications.success"),
			});

			await reloadSession();
		} catch (error) {
			toast.add({
				color: "error",
				title: t("settings.account.changeEmail.notifications.error"),
			});
		} finally {
			isSubmitting.value = false;
		}
	};
</script>

<template>
	<SettingsItem
		:title="$t('settings.account.changeEmail.title')"
		:description="$t('settings.account.changeEmail.description')"
	>
		<UForm :schema="schema" :state="state" @submit="onSubmit">
			<UFormField name="email">
				<UInput v-model="state.email" type="email" autocomplete="email" class="w-full" />
			</UFormField>

			<div class="mt-4 flex justify-end">
				<UButton type="submit" :disabled="!isDirty" :loading="isSubmitting">
					{{ $t("settings.save") }}
				</UButton>
			</div>
		</UForm>
	</SettingsItem>
</template>
