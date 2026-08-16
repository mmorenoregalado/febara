<script setup lang="ts">
	const { t } = useTranslations();
	const toast = useToast();
	const queryClient = useQueryClient();
	const { session: currentSession } = useSession();
	const authClient = useAuthClient();
	const { public: config } = useRuntimeConfig();

	const unspecifiedIpAddresses = new Set([
		"::",
		"0.0.0.0",
		"0:0:0:0:0:0:0:0",
		"0000:0000:0000:0000:0000:0000:0000:0000",
	]);
	const allZeroIpv6AddressPattern = /^(?:0{1,4}:){7}0{1,4}$/i;

	const { data: sessions, isPending } = useQuery({
		queryKey: ["active-sessions"],
		queryFn: async () => authClient.listSessions(),
	});

	const getSessionIpAddressLabel = (ipAddress: string | null | undefined) => {
		const trimmedIpAddress = ipAddress?.trim();
		const normalizedIpAddress = trimmedIpAddress?.toLowerCase();

		if (
			!normalizedIpAddress ||
			unspecifiedIpAddresses.has(normalizedIpAddress) ||
			allZeroIpv6AddressPattern.test(normalizedIpAddress)
		) {
			return t("settings.account.security.activeSessions.unknownIpAddress");
		}

		return trimmedIpAddress;
	};

	const getSessionTitle = (session: { id: string; ipAddress?: string | null }) => {
		if (session.id === currentSession.value?.id) {
			return t("settings.account.security.activeSessions.currentSession");
		}

		return getSessionIpAddressLabel(session.ipAddress);
	};

	const revokeSession = async (token: string) => {
		try {
			await authClient.revokeSession({
				token,
			});

			toast.add({
				color: "success",
				title: t("settings.account.security.activeSessions.notifications.revokeSession.success"),
			});

			if (currentSession.value?.token === token) {
				await queryClient.refetchQueries({
					queryKey: sessionQueryKey,
				});

				window.location.href = new URL(
					config.redirectAfterLogout,
					window.location.origin,
				).toString();
			} else {
				await queryClient.invalidateQueries({
					queryKey: ["active-sessions"],
				});
			}
		} catch {
			toast.add({
				color: "error",
				title: t("settings.account.security.activeSessions.notifications.revokeSession.error"),
			});
		}
	};
</script>

<template>
	<SettingsItem
		:title="$t('settings.account.security.activeSessions.title')"
		:description="$t('settings.account.security.activeSessions.description')"
	>
		<div class="gap-4 grid grid-cols-1">
			<div v-if="isPending" class="gap-2 flex">
				<USkeleton class="size-6 shrink-0" />
				<div class="flex-1">
					<USkeleton class="mb-0.5 h-4 w-full" />
					<USkeleton class="h-8 w-full" />
				</div>
				<USkeleton class="size-9 shrink-0" />
			</div>
			<div v-for="session in sessions" :key="session.id" class="gap-4 flex justify-between">
				<div class="gap-2 flex">
					<UIcon name="i-lucide-computer" class="size-6 text-primary/50 shrink-0" />
					<div>
						<strong class="text-sm block">
							{{ getSessionTitle(session) }}
						</strong>
						<small class="text-muted text-xs leading-tight block">
							{{ session.userAgent }}
						</small>
					</div>
				</div>
				<UButton
					variant="secondary"
					size="sm"
					class="shrink-0"
					@click="revokeSession(session.token)"
				>
					<UIcon name="i-lucide-x" class="size-4" />
				</UButton>
			</div>
		</div>
	</SettingsItem>
</template>
