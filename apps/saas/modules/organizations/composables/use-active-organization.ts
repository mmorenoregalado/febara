import {
	activeOrganizationQueryKey,
	organizationListQueryKey,
} from "~/modules/organizations/lib/api";

export const useActiveOrganization = () => {
	const route = useRoute();
	const queryClient = useQueryClient();
	const loadingIndicator = useLoadingIndicator();
	const { session } = useSession();
	const authClient = useAuthClient();

	const activeOrganizationSlug = computed(() => {
		const params = route.params as { organizationSlug?: string };
		if (params.organizationSlug) {
			return params.organizationSlug;
		}

		// Fall back to session's activeOrganizationId to avoid UI flashing
		// when navigating to pages without an org slug (e.g. /settings, /chatbot)
		const activeOrgId = session.value?.activeOrganizationId;
		if (!activeOrgId) return "";

		const orgList =
			queryClient.getQueryData<{ id: string; slug: string }[]>(organizationListQueryKey);
		return orgList?.find((o) => o.id === activeOrgId)?.slug ?? "";
	});

	const { data: activeOrganization, refetch: refetchActiveOrganization } =
		useActiveOrganizationQuery(activeOrganizationSlug);

	const loaded = useState("active-organization-loaded", () => {
		return activeOrganization.value !== null;
	});

	watchEffect(() => {
		if (activeOrganization.value !== null && !loaded.value) {
			loaded.value = true;
		}
	});

	const setActiveOrganization = async (organizationSlug: string | null) => {
		loadingIndicator.start();

		const newActiveOrganization = await authClient.organization.setActive(
			organizationSlug
				? {
						organizationSlug,
					}
				: {
						organizationId: null,
					},
		);

		// Persist last active organization on the user for session restoration
		await authClient.updateUser({
			lastActiveOrganizationId: newActiveOrganization?.id ?? null,
		});

		await queryClient.setQueryData(sessionQueryKey, (data: any) => {
			return {
				...data,
				session: {
					...data?.session,
					activeOrganizationId: newActiveOrganization?.id ?? null,
				},
			};
		});

		if (organizationSlug) {
			await queryClient.invalidateQueries({
				queryKey: activeOrganizationQueryKey(organizationSlug),
			});
		} else {
			await refetchActiveOrganization();
		}

		await navigateTo(organizationSlug ? `/${organizationSlug}` : "/", {
			replace: true,
		});
		loadingIndicator.finish();
	};

	const activeOrganizationUserRole = computed(() => {
		return (
			activeOrganization.value?.members.find(
				(member: { userId: string }) => member.userId === session.value?.userId,
			)?.role ?? null
		);
	});

	return {
		loaded,
		activeOrganization,
		activeOrganizationUserRole,
		setActiveOrganization,
		refetchActiveOrganization,
	};
};
