<script setup lang="ts">
	import type { FormSubmitEvent } from "@nuxt/ui";
	import { z } from "zod";

	const runtimeConfig = useRuntimeConfig();
	const { t } = useTranslations();
	const authClient = useAuthClient();

	const schema = z.object({
		email: z.email(),
	});

	type Schema = z.output<typeof schema>;

	const state = reactive<Schema>({
		email: "",
	});

	const rootError = ref<string | null>(null);
	const isSubmitting = ref(false);
	const isLinkSent = ref(false);

	const onSubmit = async (event: FormSubmitEvent<Schema>) => {
		rootError.value = null;
		isSubmitting.value = true;
		try {
			await authClient.requestPasswordReset({
				email: event.data.email,
				redirectTo: "/reset-password",
			});

			isLinkSent.value = true;
		} catch (e) {
			rootError.value = t("auth.forgotPassword.hints.linkNotSent.message");
		} finally {
			isSubmitting.value = false;
		}
	};
</script>

<template>
	<div>
		<h1 class="text-3xl font-bold text-center">{{ $t("auth.forgotPassword.title") }}</h1>
		<p class="mb-6 mt-2 text-muted text-center text-balance">
			{{ $t("auth.forgotPassword.message") }}
			<NuxtLink to="/login" class="text-gray-700">
				{{ $t("auth.forgotPassword.backToSignin") }} &rarr;
			</NuxtLink>
		</p>

		<UAlert
			v-if="isLinkSent"
			color="success"
			icon="i-lucide-mailbox"
			:description="$t('auth.forgotPassword.hints.linkSent.message')"
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

			<UFormField name="email" :label="$t('auth.forgotPassword.email')" required>
				<UInput v-model="state.email" autocomplete="email" class="w-full" />
			</UFormField>

			<UButton :loading="isSubmitting" type="submit" variant="primary">
				<UIcon name="i-lucide-send" class="mr-2 size-4" />
				{{ $t("auth.forgotPassword.submit") }} &rarr;
			</UButton>
		</UForm>
	</div>
</template>
