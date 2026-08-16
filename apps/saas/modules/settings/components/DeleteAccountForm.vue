<script lang="ts" setup>
	import type { FormSubmitEvent } from "@nuxt/ui";
	import { z } from "zod";

	const { t } = useTranslations();
	const toast = useToast();
	const showConfirmation = ref(false);
	const authClient = useAuthClient();

	const openConfirmation = () => {
		showConfirmation.value = true;
	};

	const closeConfirmation = () => {
		showConfirmation.value = false;
	};

	const deleteAccountFormId = "delete-account-form";
	const credentialAccountSchema = z.object({
		password: z.string().min(1),
	});
	const passwordlessAccountSchema = z.object({
		password: z.string().optional(),
	});
	const { data: accounts, isPending: accountsPending } = useUserAccountsQuery();
	const hasCredentialAccount = computed(() => {
		return accounts.value?.some((account) => account.providerId === "credential") ?? false;
	});
	const schema = computed(() =>
		hasCredentialAccount.value ? credentialAccountSchema : passwordlessAccountSchema,
	);
	const state = reactive<z.output<typeof passwordlessAccountSchema>>({
		password: "",
	});

	const { mutate: deleteAccount, isPending } = useMutation({
		mutationFn: async (password?: string) => {
			try {
				await authClient.deleteUser(password ? { password } : {});

				toast.add({
					color: "success",
					title: t("settings.account.deleteAccount.notifications.success"),
				});

				window.location.replace("/");
			} catch {
				toast.add({
					color: "error",
					title: t("settings.account.deleteAccount.notifications.error"),
				});
			}
		},
	});

	const onSubmit = (event: FormSubmitEvent<z.output<typeof passwordlessAccountSchema>>) => {
		deleteAccount(hasCredentialAccount.value ? event.data.password : undefined);
	};

	watch(showConfirmation, (open) => {
		if (!open) {
			state.password = "";
		}
	});
</script>

<template>
	<SettingsItem
		:title="$t('settings.account.deleteAccount.title')"
		:description="$t('settings.account.deleteAccount.description')"
		danger
	>
		<div class="flex justify-end">
			<UButton
				variant="solid"
				color="error"
				:loading="isPending || accountsPending"
				:disabled="accountsPending"
				@click="openConfirmation"
			>
				{{ $t("settings.account.deleteAccount.submit") }}
			</UButton>
		</div>
	</SettingsItem>

	<UModal
		v-model:open="showConfirmation"
		:title="$t('settings.account.deleteAccount.title')"
		:description="$t('settings.account.deleteAccount.confirmation')"
	>
		<template #body>
			<UForm
				:id="deleteAccountFormId"
				:schema="schema"
				:state="state"
				class="space-y-4"
				@submit="onSubmit"
			>
				<p class="text-sm text-muted">
					{{ $t("settings.account.deleteAccount.organizationWarning") }}
				</p>

				<p class="text-sm text-muted">
					{{
						hasCredentialAccount
							? $t("settings.account.deleteAccount.passwordConfirmation")
							: $t("settings.account.deleteAccount.passwordlessConfirmation")
					}}
				</p>

				<UFormField
					v-if="hasCredentialAccount"
					name="password"
					:label="$t('settings.account.deleteAccount.password')"
					required
				>
					<PasswordInput v-model="state.password" autocomplete="current-password" class="w-full" />
				</UFormField>
			</UForm>
		</template>

		<template #footer>
			<UButton variant="outline" @click="closeConfirmation">
				{{ $t("common.confirmation.cancel") }}
			</UButton>
			<UButton
				:form="deleteAccountFormId"
				type="submit"
				variant="solid"
				color="error"
				:loading="isPending"
				:disabled="accountsPending"
			>
				{{ $t("settings.account.deleteAccount.submit") }}
			</UButton>
		</template>
	</UModal>
</template>
