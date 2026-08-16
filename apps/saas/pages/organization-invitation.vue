<script setup lang="ts">
	import { sessionQueryKey } from "~/modules/auth/lib/api";
	import {
		fetchFreshOrganizationList,
		organizationListQueryKey,
		resolveOrganizationAfterInvitation,
	} from "~/modules/organizations/lib/api";

	type InvitationValidationStatus = "pending" | "expired" | "used" | "not_found";

	const { t } = useTranslations();
	const { public: config } = useRuntimeConfig();
	const { session, user, reloadSession } = useSession();
	const authClient = useAuthClient();
	const queryClient = useQueryClient();
	const nuxtApp = useNuxtApp();
	const headers = import.meta.server ? useRequestHeaders() : undefined;

	const {
		invitationId,
		email,
		organizationId,
		organizationName,
		organizationLogo,
		buildAuthPathWithInvitation,
	} = useInvitationQuery();

	const showOrganizationPreview = computed(() => !!organizationName.value);

	const isInitializing = ref(true);
	const isProcessing = ref(false);
	const invitationAccepted = ref(false);
	const isInvitationUnavailable = ref(false);
	const errorMessage = ref<string | null>(null);
	const invitedOrganizationSlug = ref<string | null>(null);
	const validatedOrganizationId = ref<string | null>(null);

	const hasEmailMismatch = computed(
		() => !!email.value && !!user.value?.email && email.value !== user.value.email,
	);

	const invitationDescription = computed(() => {
		if (organizationName.value) {
			return t("organizations.invitationModal.description", {
				organizationName: organizationName.value,
			});
		}

		return t("organizations.invitationAlert.description");
	});

	definePageMeta({
		layout: "default",
	});

	useSeoMeta({
		title: t("organizations.invitationModal.title"),
	});

	const getInvitationErrorMessage = (status: InvitationValidationStatus) => {
		switch (status) {
			case "expired":
				return t("auth.errors.invitationExpired");
			case "used":
				return t("auth.errors.invitationUsed");
			default:
				return t("auth.errors.invalidInvitation");
		}
	};

	const markInvitationUnavailable = (status: InvitationValidationStatus) => {
		isInvitationUnavailable.value = true;
		errorMessage.value = getInvitationErrorMessage(status);
	};

	const resolveInvitedOrganization = async () => {
		const resolvedOrganizationId = validatedOrganizationId.value || organizationId.value;

		if (resolvedOrganizationId && invitedOrganizationSlug.value) {
			return {
				id: resolvedOrganizationId,
				slug: invitedOrganizationSlug.value,
			};
		}

		return resolveOrganizationAfterInvitation({
			organizationId: resolvedOrganizationId || undefined,
			organizationName: organizationName.value || undefined,
			headers,
			authClient,
			queryClient,
		});
	};

	const completeSetupAfterAccept = async (organization: { id: string; slug: string }) => {
		try {
			const activeOrganization = await authClient.organization.setActive({
				organizationSlug: organization.slug,
			});

			await authClient.updateUser({
				lastActiveOrganizationId: organization.id,
			});

			queryClient.setQueryData(sessionQueryKey, (data: unknown) => {
				if (!data || typeof data !== "object") {
					return data;
				}

				const current = data as {
					session?: { activeOrganizationId?: string | null };
				};

				return {
					...current,
					session: {
						...current.session,
						activeOrganizationId: activeOrganization?.id ?? organization.id,
					},
				};
			});
		} catch {
			// Membership is already granted; non-fatal if active org cannot be set.
		}

		await queryClient.invalidateQueries({
			queryKey: organizationListQueryKey,
		});

		const { data: refreshedSession } = await reloadSession();

		const organizationRoute = `/${organization.slug}`;

		if (!refreshedSession?.user?.onboardingComplete) {
			await nuxtApp.runWithContext(() =>
				navigateTo(
					{ path: "/onboarding", query: { redirectTo: organizationRoute } },
					{ replace: true },
				),
			);
			return;
		}

		await nuxtApp.runWithContext(() => navigateTo(organizationRoute, { replace: true }));
	};

	const tryFinishInvitationSetup = async () => {
		const organization = await resolveInvitedOrganization();

		if (!organization) {
			throw new Error("Organization not found after invitation accept");
		}

		await completeSetupAfterAccept(organization);
	};

	const acceptInvitation = async () => {
		if (!invitationId.value || !session.value || isInvitationUnavailable.value) {
			return;
		}

		isProcessing.value = true;
		errorMessage.value = null;

		if (!invitationAccepted.value) {
			try {
				await authClient.organization.acceptInvitation({
					invitationId: invitationId.value,
				});
				invitationAccepted.value = true;
				await reloadSession();
			} catch {
				errorMessage.value = t("auth.errors.invalidInvitation");
				isProcessing.value = false;
				return;
			}
		}

		try {
			await tryFinishInvitationSetup();
		} catch {
			errorMessage.value = t("organizations.invitationModal.setupFailed");
		} finally {
			isProcessing.value = false;
		}
	};

	const rejectInvitation = async () => {
		if (!invitationId.value || !session.value || isInvitationUnavailable.value) {
			return;
		}

		isProcessing.value = true;
		errorMessage.value = null;

		try {
			await authClient.organization.rejectInvitation({
				invitationId: invitationId.value,
			});

			await nuxtApp.runWithContext(() => navigateTo(config.redirectAfterSignIn || "/"));
		} catch {
			errorMessage.value = t("auth.errors.invalidInvitation");
		} finally {
			isProcessing.value = false;
		}
	};

	const recoverAcceptedInvitation = async (targetOrganizationId?: string) => {
		const resolvedOrganizationId = targetOrganizationId || organizationId.value;

		if (!session.value || !resolvedOrganizationId) {
			return false;
		}

		const organizations = await fetchFreshOrganizationList({
			queryClient,
			headers,
			authClient,
		});

		if (!organizations?.some((organization) => organization.id === resolvedOrganizationId)) {
			return false;
		}

		invitationAccepted.value = true;
		await tryFinishInvitationSetup();
		return true;
	};

	const validateInvitation = async () => {
		if (!session.value || !invitationId.value) {
			return;
		}

		try {
			const invitation = await authClient.organization.getInvitation({
				query: {
					id: invitationId.value,
				},
			});

			validatedOrganizationId.value = invitation.organizationId;
			invitedOrganizationSlug.value = invitation.organizationSlug ?? null;

			if (hasEmailMismatch.value) {
				errorMessage.value = t("auth.errors.invalidInvitation");
			}
		} catch {
			const recovered = await recoverAcceptedInvitation(organizationId.value || undefined);

			if (!recovered) {
				markInvitationUnavailable("not_found");
			}
		}
	};

	if (!invitationId.value) {
		await navigateTo("/");
	} else {
		await reloadSession();
		await validateInvitation();
	}

	isInitializing.value = false;
</script>

<template>
	<div>
		<template v-if="!invitationId">
			<h1 class="text-3xl font-bold text-center">
				{{ $t("organizations.invitationModal.title") }}
			</h1>
			<UAlert
				class="mt-4"
				color="error"
				icon="i-lucide-alert-triangle"
				:title="$t('auth.errors.invalidInvitation')"
			/>
		</template>

		<div v-else-if="isInitializing" class="py-16 flex items-center justify-center">
			<UIcon name="i-lucide-loader" class="size-6 animate-spin text-primary" />
		</div>

		<template v-else-if="isInvitationUnavailable">
			<h1 class="text-3xl font-bold text-center">
				{{ $t("organizations.invitationModal.title") }}
			</h1>

			<UAlert
				class="mt-4"
				color="error"
				icon="i-lucide-alert-triangle"
				:description="errorMessage ?? $t('auth.errors.invalidInvitation')"
			/>

			<UButton v-if="session" class="mt-6 w-full" :to="config.redirectAfterSignIn || '/'">
				{{ $t("common.actions.continue") }}
			</UButton>
		</template>

		<template v-else-if="!session">
			<h1 class="text-3xl font-bold text-center">
				{{ $t("organizations.invitationAlert.title") }}
			</h1>

			<div
				v-if="showOrganizationPreview"
				class="gap-2 p-4 mt-4 flex flex-col items-center text-center"
			>
				<OrganizationLogo size="xl" :name="organizationName" :logo-url="organizationLogo" />
				<span class="text-highlighted font-semibold">
					{{ organizationName }}
				</span>
			</div>

			<p class="mb-6 mt-2 text-muted text-center">
				{{ $t("organizations.invitationAlert.description") }}
			</p>

			<div class="gap-3 flex flex-row">
				<UButton :to="buildAuthPathWithInvitation('/login')" variant="secondary" class="flex-1">
					{{ $t("auth.login.title") }}
				</UButton>
				<UButton :to="buildAuthPathWithInvitation('/signup')" class="flex-1">
					{{ $t("auth.signup.title") }}
				</UButton>
			</div>
		</template>

		<template v-else>
			<h1 class="text-3xl font-bold text-center">
				{{ $t("organizations.invitationModal.title") }}
			</h1>

			<div
				v-if="showOrganizationPreview"
				class="gap-2 p-4 mt-4 flex flex-col items-center text-center"
			>
				<OrganizationLogo size="xl" :name="organizationName" :logo-url="organizationLogo" />
				<span class="text-highlighted font-semibold">
					{{ organizationName }}
				</span>
			</div>

			<p class="mb-6 mt-2 text-muted text-center">
				{{ invitationDescription }}
			</p>

			<UAlert
				v-if="errorMessage"
				class="mb-4"
				color="error"
				icon="i-lucide-alert-triangle"
				:description="errorMessage"
			/>

			<div v-if="!hasEmailMismatch && !errorMessage" class="gap-3 flex flex-row">
				<UButton
					variant="secondary"
					class="flex-1"
					:disabled="isProcessing"
					@click="rejectInvitation"
				>
					{{ $t("organizations.invitationModal.decline") }}
				</UButton>
				<UButton variant="primary" class="flex-1" :loading="isProcessing" @click="acceptInvitation">
					{{ $t("organizations.invitationModal.accept") }}
				</UButton>
			</div>

			<UButton
				v-else-if="errorMessage && !hasEmailMismatch"
				class="w-full"
				:loading="isProcessing"
				@click="acceptInvitation"
			>
				{{
					invitationAccepted
						? $t("common.actions.continue")
						: $t("organizations.invitationModal.accept")
				}}
			</UButton>
		</template>
	</div>
</template>
