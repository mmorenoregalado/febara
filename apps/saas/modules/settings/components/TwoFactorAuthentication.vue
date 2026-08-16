<script setup lang="ts">
	const { t } = useTranslations();
	const toast = useToast();
	const { user, reloadSession } = useSession();
	const authClient = useAuthClient();

	const dialogOpen = ref(false);

	const closeDialog = () => {
		dialogOpen.value = false;
	};
	const dialogView = ref<"password" | "totp-url">("password");
	const totpURI = ref("");
	const password = ref("");
	const totpCode = ref("");

	const { data: accounts, isPending: accountsPending } = useUserAccountsQuery();

	watch(dialogOpen, (isOpen) => {
		if (!isOpen) {
			password.value = "";
			totpCode.value = "";
			totpURI.value = "";
			dialogView.value = "password";
		}
	});

	const totpURISecret = computed(() => {
		if (!totpURI.value) {
			return null;
		}

		try {
			const url = new URL(totpURI.value);
			return url.searchParams.get("secret") || null;
		} catch {
			return null;
		}
	});

	const verifyPassword = () => {
		dialogView.value = "password";
		dialogOpen.value = true;
	};

	const enableTwoFactorMutation = useMutation({
		mutationKey: ["enableTwoFactor"],
		mutationFn: async () => {
			const data = await authClient.twoFactor.enable({
				password: password.value,
			});

			totpURI.value = data.totpURI;
			dialogView.value = "totp-url";
		},
		onError: () => {
			toast.add({
				color: "error",
				title: t("settings.account.security.twoFactor.notifications.enable.error.title"),
			});
		},
	});

	const disableTwoFactorMutation = useMutation({
		mutationKey: ["disableTwoFactor"],
		mutationFn: async () => {
			await authClient.twoFactor.disable({
				password: password.value,
			});

			dialogOpen.value = false;

			toast.add({
				color: "success",
				title: t("settings.account.security.twoFactor.notifications.disable.success.title"),
			});

			await reloadSession();
		},
		onError: () => {
			toast.add({
				color: "error",
				title: t("settings.account.security.twoFactor.notifications.enable.error.title"),
			});
		},
	});

	const verifyTwoFactorMutation = useMutation({
		mutationKey: ["verifyTwoFactor"],
		mutationFn: async () => {
			await authClient.twoFactor.verifyTotp({
				code: totpCode.value,
			});

			toast.add({
				color: "success",
				title: t("settings.account.security.twoFactor.notifications.verify.success.title"),
			});

			await reloadSession();
			dialogOpen.value = false;
		},
		onError: () => {
			toast.add({
				color: "error",
				title: t("settings.account.security.twoFactor.notifications.verify.error.title"),
			});
		},
	});

	const handleSubmit = async (e: Event) => {
		e.preventDefault();

		if (!hasCredentialAccount.value) {
			return;
		}

		if (user.value?.twoFactorEnabled) {
			disableTwoFactorMutation.mutate();
			return;
		}

		if (dialogView.value === "password") {
			enableTwoFactorMutation.mutate();
			return;
		}

		verifyTwoFactorMutation.mutate();
	};

	const hasCredentialAccount = computed(() => {
		return accounts.value?.some((account) => account.providerId === "credential");
	});
</script>

<template>
	<SettingsItem
		:title="$t('settings.account.security.twoFactor.title')"
		:description="$t('settings.account.security.twoFactor.description')"
	>
		<div v-if="accountsPending" class="flex justify-start">
			<USkeleton class="h-9 w-56" />
		</div>

		<UAlert
			v-else-if="!hasCredentialAccount"
			color="neutral"
			icon="i-lucide-info"
			:description="$t('settings.account.security.twoFactor.passwordRequired')"
		/>

		<div v-else-if="user?.twoFactorEnabled" class="gap-4 flex flex-col items-start">
			<div class="gap-1.5 flex items-center">
				<UIcon name="i-lucide-shield-check" class="size-6 text-green-500" />
				<p class="text-sm text-highlighted">
					{{ $t("settings.account.security.twoFactor.enabled") }}
				</p>
			</div>
			<UButton variant="secondary" @click="verifyPassword">
				<UIcon name="i-lucide-x" class="mr-1.5 size-4" />
				{{ $t("settings.account.security.twoFactor.disable") }}
			</UButton>
		</div>
		<div v-else class="flex justify-start">
			<UButton variant="secondary" @click="verifyPassword">
				<UIcon name="i-lucide-smartphone" class="mr-1.5 size-4" />
				{{ $t("settings.account.security.twoFactor.enable") }}
			</UButton>
		</div>

		<UModal v-model:open="dialogOpen" :dismissible="false">
			<template #header>
				<div class="gap-3 flex w-full items-center justify-between">
					<h3 class="text-lg font-semibold">
						{{
							dialogView === "password"
								? $t("settings.account.security.twoFactor.dialog.password.title")
								: $t("settings.account.security.twoFactor.dialog.totpUrl.title")
						}}
					</h3>
					<UButton
						type="button"
						variant="ghost"
						size="icon"
						:aria-label="$t('common.actions.close')"
						@click="closeDialog"
					>
						<UIcon name="i-lucide-x" class="size-4" />
					</UButton>
				</div>
			</template>

			<template #body>
				<form v-if="dialogView === 'password'" @submit="handleSubmit">
					<div class="gap-4 grid grid-cols-1">
						<p class="text-sm text-muted">
							{{ $t("settings.account.security.twoFactor.dialog.password.description") }}
						</p>

						<UFormField :label="$t('settings.account.security.twoFactor.dialog.password.label')">
							<PasswordInput v-model="password" />
						</UFormField>
					</div>
					<div class="mt-4">
						<UButton
							type="submit"
							variant="secondary"
							class="w-full"
							:loading="
								enableTwoFactorMutation.isPending.value || disableTwoFactorMutation.isPending.value
							"
						>
							{{ $t("common.actions.continue") }}
							<UIcon name="i-lucide-arrow-right" class="ml-1.5 size-4" />
						</UButton>
					</div>
				</form>

				<form v-else @submit="handleSubmit">
					<div class="gap-4 grid grid-cols-1">
						<p class="text-sm text-muted">
							{{ $t("settings.account.security.twoFactor.dialog.totpUrl.description") }}
						</p>
						<UCard class="gap-4 p-6 flex flex-col items-center">
							<!-- QR Code will be rendered here -->
							<!-- You may need to install a QR code library like vue-qrcode-generator -->
							<div v-if="totpURI" class="gap-4 flex flex-col items-center">
								<img
									:src="`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totpURI)}`"
									:alt="totpURI"
									class="w-48 h-48"
								/>
								<p v-if="totpURISecret" class="text-xs text-muted text-center">
									{{ totpURISecret }}
								</p>
							</div>
						</UCard>

						<hr />

						<div class="gap-4 grid grid-cols-1">
							<UFormField :label="$t('settings.account.security.twoFactor.dialog.totpUrl.code')">
								<UInput v-model="totpCode" />
							</UFormField>
						</div>
					</div>
					<div class="mt-4">
						<UButton
							type="submit"
							variant="secondary"
							class="w-full"
							:loading="verifyTwoFactorMutation.isPending.value"
						>
							<UIcon name="i-lucide-check" class="mr-1.5 size-4" />
							{{ $t("common.actions.verify") }}
						</UButton>
					</div>
				</form>
			</template>
		</UModal>
	</SettingsItem>
</template>
