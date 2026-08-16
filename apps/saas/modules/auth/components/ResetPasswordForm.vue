<script setup lang="ts">
	import type { FormSubmitEvent } from "@nuxt/ui";
	import { passwordSchema } from "@repo/utils";
	import { z } from "zod";

	const { t } = useTranslations();
	const authClient = useAuthClient();
	const route = useRoute();

	const token = computed(() => route.query.token as string | undefined);

	const schema = z.object({
		password: passwordSchema,
	});

	type Schema = z.output<typeof schema>;

	const state = reactive<Schema>({
		password: "",
	});

	const rootError = ref<string | null>(null);
	const isSubmitting = ref(false);
	const isResetSuccessful = ref(false);

	const onSubmit = async (event: FormSubmitEvent<Schema>) => {
		rootError.value = null;
		isSubmitting.value = true;
		try {
			await authClient.resetPassword({
				newPassword: event.data.password,
				token: token.value,
			});

			isResetSuccessful.value = true;
		} catch (e) {
			rootError.value = t("auth.resetPassword.hints.error");
		} finally {
			isSubmitting.value = false;
		}
	};
</script>

<template>
	<div>
		<h1 class="text-3xl font-bold text-center">{{ $t("auth.resetPassword.title") }}</h1>
		<p class="mb-6 mt-2 text-muted text-center text-balance">
			{{ $t("auth.resetPassword.message") }}
			<NuxtLink to="/login" class="text-gray-700">
				{{ $t("auth.resetPassword.backToSignin") }} &rarr;
			</NuxtLink>
		</p>

		<UAlert
			v-if="isResetSuccessful"
			color="success"
			icon="i-lucide-check-circle"
			:description="$t('auth.resetPassword.hints.success')"
		/>

		<UForm
			v-else
			:schema="schema"
			:state="state"
			@submit="onSubmit"
			class="gap-6 flex flex-col items-stretch"
		>
			<UAlert
				v-if="rootError"
				color="error"
				icon="i-lucide-alert-triangle"
				:description="rootError"
			/>

			<UFormField name="password" :label="$t('auth.resetPassword.newPassword')" required>
				<PasswordInput
					v-model="state.password"
					autocomplete="new-password"
					class="w-full"
					required
					showGenerateButton
					showPasswordCriteria
				/>
			</UFormField>

			<UButton :loading="isSubmitting" type="submit" variant="primary">
				{{ $t("auth.resetPassword.submit") }} &rarr;
			</UButton>
		</UForm>
	</div>
</template>
