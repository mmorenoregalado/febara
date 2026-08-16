<script setup lang="ts">
	import { config as authConfig } from "@repo/auth/config";

	import { sessionQueryKey } from "~/modules/auth/lib/api";
	import {
		activeOrganizationQueryKey,
		fetchActiveOrganization,
		fetchOrganizationList,
		organizationListQueryKey,
	} from "~/modules/organizations/lib/api";
	import { resolveActiveOrganizationState } from "~/modules/organizations/lib/resolve-active-organization";

	const route = useRoute();
	const headers = useRequestHeaders();
	const queryClient = useQueryClient();
	const authClient = useAuthClient();
	const { isCollapsed } = useSidebar();
	const { reloadSession } = useSession();
	const {
		public: { useSidebarLayout },
	} = useRuntimeConfig();

	useSetupPermissions();

	const { data: sessionData } = await reloadSession();

	if (!sessionData?.session) {
		await navigateTo("/login");
	}

	if (!sessionData?.user.onboardingComplete) {
		await navigateTo("/onboarding");
	}

	const organizations = authConfig.organizations.enable
		? await queryClient.fetchQuery({
				queryKey: organizationListQueryKey,
				queryFn: () => fetchOrganizationList({ headers, authClient }),
			})
		: [];

	const requiresActiveOrganization =
		authConfig.organizations.requireOrganization || route.meta.requiresActiveOrganization === true;

	const activeOrganizationResolution = resolveActiveOrganizationState({
		organizationsEnabled: authConfig.organizations.enable,
		activeOrganizationId: sessionData?.session.activeOrganizationId,
		organizations,
		requiresActiveOrganization,
	});

	if (activeOrganizationResolution.action === "redirect-new-organization") {
		await navigateTo("/new-organization");
	}

	if (activeOrganizationResolution.action === "set") {
		const activeOrganization = await authClient.organization.setActive({
			organizationSlug: activeOrganizationResolution.organization.slug,
			fetchOptions: {
				headers,
			},
		});

		await authClient.updateUser({
			lastActiveOrganizationId: activeOrganization?.id ?? null,
			fetchOptions: {
				headers,
			},
		});

		queryClient.setQueryData(sessionQueryKey, (data: any) => ({
			...data,
			session: {
				...data?.session,
				activeOrganizationId: activeOrganization?.id ?? null,
			},
		}));
	}

	if (activeOrganizationResolution.action === "clear") {
		await authClient.organization.setActive({
			organizationId: null,
			fetchOptions: {
				headers,
			},
		});

		await authClient.updateUser({
			lastActiveOrganizationId: null,
			fetchOptions: {
				headers,
			},
		});

		queryClient.setQueryData(sessionQueryKey, (data: any) => ({
			...data,
			session: {
				...data?.session,
				activeOrganizationId: null,
			},
		}));
	}

	const normalizedActiveOrganizationId =
		activeOrganizationResolution.action === "set"
			? activeOrganizationResolution.organization.id
			: activeOrganizationResolution.action === "clear"
				? null
				: (sessionData?.session.activeOrganizationId ?? null);

	const fallbackOrganization =
		organizations.find((organization) => organization.id === normalizedActiveOrganizationId) ??
		organizations[0];

	const fallbackOrganizationRoute = fallbackOrganization?.slug
		? `/${fallbackOrganization.slug}`
		: "/";

	if (route.path === "/" && requiresActiveOrganization && fallbackOrganization?.slug) {
		await navigateTo(fallbackOrganizationRoute, { replace: true });
	}

	const organizationSlug =
		"organizationSlug" in route.params ? (route.params.organizationSlug as string) : null;
	const activeOrganizationPromise =
		authConfig.organizations.enable && organizationSlug
			? queryClient.fetchQuery({
					queryKey: activeOrganizationQueryKey(organizationSlug),
					queryFn: () => fetchActiveOrganization(organizationSlug, { headers, authClient }),
				})
			: Promise.resolve(null);

	const activeOrganization = await activeOrganizationPromise;

	if (organizationSlug && activeOrganization === null) {
		if (fallbackOrganizationRoute) {
			await navigateTo(fallbackOrganizationRoute, { replace: true });
		} else {
			throw createError({
				statusCode: 404,
				statusMessage: "Organization not found",
			});
		}
	}
</script>

<template>
	<div class="bg-default md:h-screen md:overflow-hidden">
		<NavBar />

		<div
			:class="[
				'md:h-screen flex',
				{
					'md:ml-[280px]': useSidebarLayout && !isCollapsed,
					'md:ml-[80px]': useSidebarLayout && isCollapsed,
				},
			]"
		>
			<main class="md:border-l md:border-t-0 md:overflow-y-auto py-4 w-full border-t">
				<div class="container">
					<slot />
				</div>
			</main>
		</div>
	</div>
</template>
