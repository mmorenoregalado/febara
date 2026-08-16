import type { OrganizationMetadata } from "@repo/auth";
import type { QueryClient } from "@tanstack/vue-query";

export const organizationListQueryKey = ["user", "organizations"] as const;

interface OrganizationAfterInvitation {
	id: string;
	slug: string;
}

export const fetchFreshOrganizationList = async ({
	queryClient,
	headers,
	authClient,
}: {
	queryClient: QueryClient;
	headers?: HeadersInit;
	authClient: ReturnType<typeof useAuthClient>;
}) => {
	await queryClient.invalidateQueries({ queryKey: organizationListQueryKey });

	return queryClient.fetchQuery({
		queryKey: organizationListQueryKey,
		queryFn: async () => fetchOrganizationList({ headers, authClient }),
		staleTime: 0,
	});
};

/** Resolve the organization the user just joined; never guesses from list order. */
export const resolveOrganizationAfterInvitation = async ({
	organizationId,
	organizationName,
	headers,
	authClient,
	queryClient,
}: {
	organizationId?: string;
	organizationName?: string;
	headers?: HeadersInit;
	authClient: ReturnType<typeof useAuthClient>;
	queryClient: QueryClient;
}): Promise<OrganizationAfterInvitation | null> => {
	if (organizationId) {
		const organization = await authClient.organization.getFullOrganization({
			query: { organizationId },
			fetchOptions: { headers },
		});

		if (organization?.id && organization.slug) {
			return { id: organization.id, slug: organization.slug };
		}
	}

	const organizations = await fetchFreshOrganizationList({
		queryClient,
		headers,
		authClient,
	});

	if (organizationId) {
		const byId = organizations?.find((org) => org.id === organizationId);

		if (byId?.id && byId.slug) {
			return { id: byId.id, slug: byId.slug };
		}
	}

	if (organizationName) {
		const byName = organizations?.find((org) => org.name === organizationName);

		if (byName?.id && byName.slug) {
			return { id: byName.id, slug: byName.slug };
		}
	}

	return null;
};
export const fetchOrganizationList = async ({
	headers,
	authClient,
}: {
	headers?: HeadersInit;
	authClient: ReturnType<typeof useAuthClient>;
}) => {
	const data = await authClient.organization.list({
		fetchOptions: {
			headers,
		},
	});

	return data;
};
export const useOrganizationListQuery = () => {
	const headers = useRequestHeaders();
	const authClient = useAuthClient();

	return useQuery({
		queryKey: organizationListQueryKey,
		queryFn: async () => fetchOrganizationList({ headers, authClient }),
	});
};

export const activeOrganizationQueryKey = (slug: string) =>
	["user", "activeOrganization", slug] as const;
export const fetchActiveOrganization = async (
	slug: string,
	{ headers, authClient }: { headers?: HeadersInit; authClient: ReturnType<typeof useAuthClient> },
) => {
	const data = await authClient.organization.getFullOrganization({
		query: {
			organizationSlug: slug,
		},
		fetchOptions: {
			headers,
		},
	});

	return data;
};
export const useActiveOrganizationQuery = (
	slug: MaybeRefOrGetter<string>,
	options?: {
		enabled?: MaybeRefOrGetter<boolean>;
	},
) => {
	const headers = useRequestHeaders();
	const authClient = useAuthClient();
	const slugValue = computed(() => toValue(slug));

	return useQuery({
		queryKey: computed(() => activeOrganizationQueryKey(slugValue.value)),
		queryFn: async () => {
			return slugValue.value
				? fetchActiveOrganization(slugValue.value, { headers, authClient })
				: null;
		},
		enabled: computed(
			() => !!slugValue.value && (options?.enabled !== undefined ? toValue(options.enabled) : true),
		),
	});
};

export const fullOrganizationQueryKey = (id: string) => ["fullOrganization", id] as const;
export const useFullOrganizationQuery = (id: string) => {
	const headers = useRequestHeaders();
	const authClient = useAuthClient();

	return useQuery({
		queryKey: fullOrganizationQueryKey(id),
		queryFn: async () =>
			id
				? authClient.organization.getFullOrganization({
						query: {
							organizationId: id,
						},
						fetchOptions: {
							headers,
						},
					})
				: null,
	});
};

/*
 * Create organization
 */
export const createOrganizationMutationKey = ["create-organization"] as const;
export const useCreateOrganizationMutation = () => {
	const orpcClient = useNuxtApp().$orpcClient;
	const authClient = useAuthClient();
	return useMutation({
		mutationKey: createOrganizationMutationKey,
		mutationFn: async ({ name, metadata }: { name: string; metadata?: OrganizationMetadata }) => {
			const { slug } = await orpcClient.organizations.generateSlug({
				name,
			});

			const data = await authClient.organization.create({
				name,
				slug,
				metadata,
			});

			return data;
		},
	});
};

/*
 * Update organization
 */
export const updateOrganizationMutationKey = ["update-organization"] as const;
export const useUpdateOrganizationMutation = () => {
	const orpcClient = useNuxtApp().$orpcClient;
	const authClient = useAuthClient();
	return useMutation({
		mutationKey: updateOrganizationMutationKey,
		mutationFn: async ({
			id,
			name,
			metadata,
			updateSlug,
		}: {
			id: string;
			name: string;
			metadata?: OrganizationMetadata;
			updateSlug?: boolean;
		}) => {
			const slug = updateSlug
				? (
						await orpcClient.organizations.generateSlug({
							name,
						})
					).slug
				: undefined;

			const data = await authClient.organization.update({
				organizationId: id,
				data: {
					name,
					slug,
					metadata,
				},
			});

			return data;
		},
	});
};
