<script setup lang="ts">
	import type { FormSubmitEvent } from "@nuxt/ui";
	import { z } from "zod";

	import { resolvePostLoginRedirect } from "~/modules/auth/lib/post-login-redirect";

	const { public: config } = useRuntimeConfig();
	const { t } = useTranslations();
	const authClient = useAuthClient();
	const { reloadSession } = useSession();
	const { invitationRedirectPath } = useInvitationQuery();
	const redirectToParam = useRouteQueryParam("redirectTo");

	const schema = z.object({
		code: z.string().min(6).max(6),
	});

	type Schema = z.output<typeof schema>;

	const code = ref<number[]>([]);

	const state = computed<Schema>(() => ({
		code: code.value.join(""),
	}));

	const redirectTo = computed(() =>
		resolvePostLoginRedirect({
			invitationRedirectPath: invitationRedirectPath.value,
			redirectToParam: redirectToParam.value,
			redirectAfterSignIn: config.redirectAfterSignIn,
		}),
	);

	const rootError = ref<string | null>(null);
	const isSubmitting = ref(false);

	const verifyCode = async (data: Schema) => {
		if (isSubmitting.value) {
			return;
		}

		rootError.value = null;
		isSubmitting.value = true;

		try {
			await authClient.twoFactor.verifyTotp({
				code: data.code,
			});

			await reloadSession();
			await navigateTo(redirectTo.value);
		} catch (e) {
			rootError.value = t("auth.verify.invalidCode");
		} finally {
			isSubmitting.value = false;
		}
	};

	const onSubmit = async (event: FormSubmitEvent<Schema>) => {
		await verifyCode(event.data);
	};

	watch(
		() => state.value.code,
		async (value) => {
			if (value.length === 6) {
				await verifyCode({ code: value });
			}
		},
	);
</script>

<template>
	<div>
		<h1 class="text-2xl font-bold">{{ $t("auth.verify.title") }}</h1>
		<p class="text-muted mt-2 mb-4">
			{{ $t("auth.verify.message") }}
		</p>

		<UForm
			:schema="schema"
			:state="state"
			:validate-on="['input']"
			@submit="onSubmit"
			class="gap-4 flex flex-col items-stretch"
		>
			<UAlert
				v-if="rootError"
				color="error"
				icon="i-lucide-alert-triangle"
				:description="rootError"
			/>

			<UFormField
				name="code"
				:label="$t('auth.verify.code')"
				:ui="{ labelWrapper: 'justify-center', label: 'text-center' }"
				class="text-center"
			>
				<div class="flex justify-center">
					<UPinInput
						id="one-time-code"
						v-model="code"
						name="one-time-code"
						type="number"
						otp
						required
						:length="6"
						size="xl"
					/>
				</div>
			</UFormField>

			<UButton class="w-full" type="submit" :loading="isSubmitting" variant="primary">
				{{ $t("auth.verify.submit") }}
			</UButton>
		</UForm>

		<div class="mt-6 text-sm text-center">
			<NuxtLink to="/login" class="text-highlighted hover:underline">
				<UIcon name="i-lucide-arrow-left" class="mr-1 size-4 inline align-middle" />
				{{ $t("auth.verify.backToSignin") }}
			</NuxtLink>
		</div>
	</div>
</template>
