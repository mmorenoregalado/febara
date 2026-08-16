<script setup lang="ts">
	import type { FormSubmitEvent } from "@nuxt/ui";
	import { passwordSchema } from "@repo/utils";
	import { z } from "zod";

	const { t } = useTranslations();
	const { reloadSession } = useSession();
	const toast = useToast();
	const authClient = useAuthClient();
	const queryClient = useQueryClient();

	const schema = z.object({
		currentPassword: z.string().min(1),
		newPassword: passwordSchema,
	});

	type Schema = z.output<typeof schema>;

	const state = reactive<Schema>({
		currentPassword: "",
		newPassword: "",
	});

	const initialState = { currentPassword: "", newPassword: "" };
	const isSubmitting = ref(false);
	const isDirty = computed(
		() =>
			state.currentPassword !== initialState.currentPassword ||
			state.newPassword !== initialState.newPassword,
	);

	const onSubmit = async (event: FormSubmitEvent<Schema>) => {
		isSubmitting.value = true;
		try {
			await authClient.changePassword({
				currentPassword: event.data.currentPassword,
				newPassword: event.data.newPassword,
				revokeOtherSessions: true,
			});

			await queryClient.invalidateQueries({
				queryKey: ["active-sessions"],
			});

			toast.add({
				color: "success",
				title: t("settings.account.security.changePassword.notifications.success"),
			});

			state.currentPassword = "";
			state.newPassword = "";

			await reloadSession();
		} catch (error) {
			toast.add({
				color: "error",
				title: t("settings.account.security.changePassword.notifications.error"),
			});
		} finally {
			isSubmitting.value = false;
		}
	};
</script>

<template>
	<SettingsItem :title="$t('settings.account.security.changePassword.title')">
		<UForm :schema="schema" :state="state" @submit="onSubmit">
			<div class="gap-4 grid grid-cols-1">
				<UFormField
					name="currentPassword"
					:label="$t('settings.account.security.changePassword.currentPassword')"
				>
					<PasswordInput v-model="state.currentPassword" autocomplete="current-password" />
				</UFormField>

				<UFormField
					name="newPassword"
					:label="$t('settings.account.security.changePassword.newPassword')"
				>
					<PasswordInput
						v-model="state.newPassword"
						autocomplete="new-password"
						show-generate-button
						show-password-criteria
					/>
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
