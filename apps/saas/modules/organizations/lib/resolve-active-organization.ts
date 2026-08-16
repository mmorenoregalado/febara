type OrganizationListItem = {
	id: string;
	slug?: string | null;
};

type ResolveActiveOrganizationStateInput = {
	organizationsEnabled: boolean;
	activeOrganizationId?: string | null;
	organizations: OrganizationListItem[];
	requiresActiveOrganization: boolean;
};

export type ResolveActiveOrganizationStateResult =
	| {
			action: "noop";
	  }
	| {
			action: "set";
			organization: {
				id: string;
				slug: string;
			};
	  }
	| {
			action: "clear";
	  }
	| {
			action: "redirect-new-organization";
	  };

export const resolveActiveOrganizationState = ({
	organizationsEnabled,
	activeOrganizationId,
	organizations,
	requiresActiveOrganization,
}: ResolveActiveOrganizationStateInput): ResolveActiveOrganizationStateResult => {
	if (!organizationsEnabled) {
		return { action: "noop" };
	}

	const availableOrganizations = organizations.filter(
		(organization): organization is { id: string; slug: string } =>
			Boolean(organization.id && organization.slug),
	);

	if (activeOrganizationId) {
		const activeOrganizationStillAccessible = availableOrganizations.some(
			(organization) => organization.id === activeOrganizationId,
		);

		if (activeOrganizationStillAccessible) {
			return { action: "noop" };
		}

		const fallbackOrganization = availableOrganizations[0];

		if (fallbackOrganization) {
			return {
				action: "set",
				organization: fallbackOrganization,
			};
		}

		return requiresActiveOrganization
			? {
					action: "redirect-new-organization",
				}
			: {
					action: "clear",
				};
	}

	if (!requiresActiveOrganization) {
		return { action: "noop" };
	}

	const fallbackOrganization = availableOrganizations[0];

	return fallbackOrganization
		? {
				action: "set",
				organization: fallbackOrganization,
			}
		: {
				action: "redirect-new-organization",
			};
};
