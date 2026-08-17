<script setup lang="ts">
	import type { FormSubmitEvent } from "@nuxt/ui";
	import { config as authConfig } from "@repo/auth/config";
	import { z } from "zod";

	import { resolvePostLoginRedirect } from "~/modules/auth/lib/post-login-redirect";

	const { public: config } = useRuntimeConfig();
	const { t } = useTranslations();
	const authClient = useAuthClient();
	const queryClient = useQueryClient();
	const route = useRoute();
	const router = useRouter();

	const schema = z.union([
		z.object({
			mode: z.literal("magic-link"),
			email: z.email(),
		}),
		z.object({
			mode: z.literal("password"),
			email: z.email(),
			password: z.string().min(1),
		}),
	]);

	type Schema = z.output<typeof schema>;

	const { invitationId, invitationRedirectPath, buildAuthPathWithInvitation } =
		useInvitationQuery();
	const redirectToParam = useRouteQueryParam("redirectTo");
	const emailParam = useRouteQueryParam("email");

	const redirectTo = computed(() =>
		resolvePostLoginRedirect({
			invitationRedirectPath: invitationRedirectPath.value,
			redirectToParam: redirectToParam.value,
			redirectAfterSignIn: config.redirectAfterSignIn,
		}),
	);

	const handleRedirect = () => {
		navigateTo(redirectTo.value);
	};

	const getTwoFactorVerifyRoute = () => {
		return {
			path: "/verify",
			query: {
				...route.query,
				twoFactor: "true",
			},
		};
	};

	const getTwoFactorVerifyPath = () => {
		return router.resolve(getTwoFactorVerifyRoute()).href;
	};

	const state = reactive<Schema>({
		mode: "password",
		email: "",
		password: "",
	});

	const rootError = ref<string | null>(null);
	const isMagicLinkSent = ref(false);
	const isSubmitting = ref(false);

	watch(
		() => state.mode,
		async () => {
			if (state.mode === "password") {
				state.password = "";
			}
			rootError.value = null;
			isMagicLinkSent.value = false;
		},
	);

	watchEffect(() => {
		if (emailParam.value) {
			state.email = emailParam.value;
		}
	});

	const onSubmit = async (event: FormSubmitEvent<Schema>) => {
		rootError.value = null;
		isSubmitting.value = true;
		try {
			if (event.data.mode === "password") {
				const data = await authClient.signIn.email({
					email: event.data.email,
					password: event.data.password,
				});

				if ((data as { twoFactorRedirect?: boolean }).twoFactorRedirect) {
					navigateTo(getTwoFactorVerifyRoute());
					return;
				}

				await queryClient.invalidateQueries({
					queryKey: sessionQueryKey,
				});

				handleRedirect();
			} else {
				await authClient.signIn.magicLink({
					email: event.data.email,
					callbackURL: getTwoFactorVerifyPath(),
				});
				isMagicLinkSent.value = true;
			}
		} catch (e) {
			rootError.value = t("auth.login.hints.invalidCredentials");
		} finally {
			isSubmitting.value = false;
		}
	};

	const isPasskeyLoading = ref(false);
	const handlePasskeySignIn = async () => {
		try {
			isPasskeyLoading.value = true;
			await authClient.signIn.passkey();
			handleRedirect();
		} catch (e) {
			rootError.value = t("auth.login.hints.invalidCredentials");
		} finally {
			isPasskeyLoading.value = false;
		}
	};
</script>

<template>
	<div>
		<h1 class="text-2xl font-bold text-center">{{ $t("auth.login.title") }}</h1>
		<p class="text-muted mt-2 mb-4 text-center">
			{{ $t("auth.login.subtitle") }}
		</p>

		<UAlert
			v-if="isMagicLinkSent"
			color="success"
			icon="i-lucide-mailbox"
			:description="$t('auth.login.hints.linkSent.message')"
			class="mt-4"
		/>

		<template v-else>
			<OrganizationInvitationInfo v-if="invitationId" />

			<UForm
				:schema="schema"
				:state="state"
				:validate-on="['input']"
				@submit="onSubmit"
				class="mt-4 gap-4 flex flex-col items-stretch"
			>
				<SigninModeSwitch class="w-full" v-model="state.mode" />

				<UAlert
					v-if="rootError"
					color="error"
					icon="i-lucide-alert-triangle"
					:description="rootError"
				/>

				<UFormField name="email" :label="$t('auth.signup.email')">
					<UInput
						v-model="state.email"
						type="text"
						id="email"
						autocomplete="email"
						class="w-full"
					/>
				</UFormField>

				<div v-if="state.mode === 'password'" class="relative">
					<UFormField :label="$t('auth.signup.password')" name="password">
						<PasswordInput
							v-model="state.password"
							id="password"
							autocomplete="current-password"
							class="w-full"
							required
						/>
					</UFormField>
					<NuxtLink
						to="/forgot-password"
						class="text-muted hover:text-highlighted top-0 right-0 text-xs leading-5 absolute"
					>
						{{ $t("auth.login.forgotPassword") }}
					</NuxtLink>
				</div>

				<UButton class="w-full" type="submit" :loading="isSubmitting" variant="primary">
					{{ state.mode === "password" ? t("auth.login.submit") : t("auth.login.sendMagicLink") }}
				</UButton>
			</UForm>

			<UButton
				v-if="authConfig.enablePasskeys"
				class="mt-2 w-full"
				variant="secondary"
				type="button"
				:loading="isPasskeyLoading"
				@click="handlePasskeySignIn"
			>
				<UIcon name="i-lucide-key-round" class="mr-2 size-4 opacity-70" />
				{{ $t("auth.login.loginWithPasskey") }}
			</UButton>

			<div class="mt-6 text-sm text-center">
				<span class="text-muted"> {{ $t("auth.login.dontHaveAnAccount") }}&nbsp;</span>
				<NuxtLink
					:to="buildAuthPathWithInvitation('/signup', { email: state.email })"
					class="text-highlighted hover:underline"
				>
					{{ $t("auth.login.createAnAccount") }} &rarr;
				</NuxtLink>
			</div>
		</template>
	</div>
</template>
