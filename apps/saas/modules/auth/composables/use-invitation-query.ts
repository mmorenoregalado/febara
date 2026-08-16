const buildOrganizationInvitationPath = ({
	invitationId,
	email,
	organizationId,
	organizationName,
	organizationLogo,
}: {
	invitationId: string;
	email?: string;
	organizationId?: string;
	organizationName?: string;
	organizationLogo?: string;
}) => {
	const params = new URLSearchParams({ invitationId });

	if (email) {
		params.set("email", email);
	}

	if (organizationId) {
		params.set("organizationId", organizationId);
	}

	if (organizationName) {
		params.set("organizationName", organizationName);
	}

	if (organizationLogo) {
		params.set("organizationLogo", organizationLogo);
	}

	return `/organization-invitation?${params.toString()}`;
};

export const useInvitationQuery = () => {
	const route = useRoute();

	const invitationId = computed(() => {
		const id = route.query.invitationId ?? route.query.invitationCode;

		if (id == null || id === "") {
			return "";
		}

		return Array.isArray(id) ? (id[0] ?? "") : String(id);
	});

	const email = computed(() => {
		const value = route.query.email;

		if (value == null || value === "") {
			return "";
		}

		return Array.isArray(value) ? (value[0] ?? "") : String(value);
	});

	const organizationId = computed(() => {
		const value = route.query.organizationId;

		if (value == null || value === "") {
			return "";
		}

		return Array.isArray(value) ? (value[0] ?? "") : String(value);
	});

	const organizationName = computed(() => {
		const value = route.query.organizationName;

		if (value == null || value === "") {
			return "";
		}

		return Array.isArray(value) ? (value[0] ?? "") : String(value);
	});

	const organizationLogo = computed(() => {
		const value = route.query.organizationLogo;

		if (value == null || value === "") {
			return "";
		}

		return Array.isArray(value) ? (value[0] ?? "") : String(value);
	});

	const invitationRedirectPath = computed(() => {
		if (!invitationId.value) {
			return "";
		}

		return buildOrganizationInvitationPath({
			invitationId: invitationId.value,
			email: email.value || undefined,
			organizationId: organizationId.value || undefined,
			organizationName: organizationName.value || undefined,
			organizationLogo: organizationLogo.value || undefined,
		});
	});

	const buildAuthPathWithInvitation = (
		path: "/login" | "/signup",
		options?: {
			email?: string;
		},
	) => {
		if (!invitationId.value) {
			return path;
		}

		const params = new URLSearchParams({
			invitationId: invitationId.value,
		});

		const emailValue = options?.email || email.value;

		if (emailValue) {
			params.set("email", emailValue);
		}

		if (organizationId.value) {
			params.set("organizationId", organizationId.value);
		}

		if (organizationName.value) {
			params.set("organizationName", organizationName.value);
		}

		if (organizationLogo.value) {
			params.set("organizationLogo", organizationLogo.value);
		}

		return `${path}?${params.toString()}`;
	};

	return {
		invitationId,
		email,
		organizationId,
		organizationName,
		organizationLogo,
		invitationRedirectPath,
		buildAuthPathWithInvitation,
		buildOrganizationInvitationPath,
	};
};
