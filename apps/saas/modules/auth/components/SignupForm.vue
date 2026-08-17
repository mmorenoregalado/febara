<script setup lang="ts">
	import type { FormSubmitEvent } from "@nuxt/ui";
	import { passwordSchema } from "@repo/utils";
	import { z } from "zod";

	const { t } = useTranslations();
	const authClient = useAuthClient();

	const schema = z.object({
		name: z.string().min(1),
		email: z.email(),
		password: passwordSchema,
	});

	type Schema = z.output<typeof schema>;

	const { invitationId, invitationRedirectPath, buildAuthPathWithInvitation } =
		useInvitationQuery();
	const emailParam = useRouteQueryParam("email");

	const state = reactive<Schema>({
		name: "",
		email: "",
		password: "",
	});

	const rootError = ref<string | null>(null);
	const isSubmitSuccessful = ref(false);
	const isSubmitting = ref(false);

	watchEffect(() => {
		if (emailParam.value) {
			state.email = emailParam.value;
		}
	});

	const onSubmit = async (event: FormSubmitEvent<Schema>) => {
		rootError.value = null;
		isSubmitting.value = true;
		try {
			await authClient.signUp.email({
				email: event.data.email,
				password: event.data.password,
				name: event.data.name,
				...(invitationRedirectPath.value ? { callbackURL: invitationRedirectPath.value } : {}),
			});

			isSubmitSuccessful.value = true;
		} catch (e) {
			rootError.value = t("auth.signup.hints.signupFailed");
		} finally {
			isSubmitting.value = false;
		}
	};
</script>

<template>
	<div>
		<h1 class="text-3xl font-bold text-center">{{ $t("auth.signup.title") }}</h1>
		<p class="mb-6 mt-2 text-muted text-center text-balance">
			{{ $t("auth.signup.message") }}
		</p>

		<UAlert
			v-if="isSubmitSuccessful"
			color="success"
			icon="i-lucide-mailbox"
			:description="$t('auth.signup.hints.verifyEmail')"
		/>

		<template v-else>
			<OrganizationInvitationInfo v-if="invitationId" />

			<UForm
				:schema="schema"
				:state="state"
				@submit="onSubmit"
				class="gap-6 flex w-full flex-col items-stretch"
			>
				<UAlert
					v-if="rootError"
					color="error"
					icon="i-lucide-alert-triangle"
					:description="rootError"
				/>

				<UFormField name="name" :label="$t('auth.signup.name')">
					<UInput v-model="state.name" autocomplete="name" class="w-full" />
				</UFormField>

				<UFormField name="email" :label="$t('auth.signup.email')" required>
					<UInput v-model="state.email" autocomplete="email" class="w-full" />
				</UFormField>

				<UFormField name="password" :label="$t('auth.signup.password')" class="w-full" required>
					<PasswordInput
						v-model="state.password"
						autocomplete="new-password"
						class="w-full"
						required
						showPasswordCriteria
					/>
				</UFormField>

				<UButton :loading="isSubmitting" type="submit" variant="primary">
					{{ $t("auth.signup.submit") }} &rarr;
				</UButton>

				<p>
					<span class="text-muted"> {{ $t("auth.signup.alreadyHaveAccount") }}&nbsp;</span>
					<NuxtLink :to="buildAuthPathWithInvitation('/login', { email: state.email })">
						{{ $t("auth.signup.signIn") }} &rarr;
					</NuxtLink>
				</p>
			</UForm>
		</template>
	</div>
</template>
