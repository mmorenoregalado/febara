import { config as authConfig } from "@repo/auth/config";

import { getSafeRedirectPath } from "~/modules/shared/utils/redirect";

type ResolvePostLoginRedirectInput = {
	invitationRedirectPath?: string | null;
	redirectToParam?: string | null;
	redirectAfterSignIn?: string | null;
};

/**
 * Resolves the destination a user is sent to after authenticating.
 *
 * When an organization is required, the default destination is "/" so the
 * organization requirement is resolved in a single pass rather than relying on
 * follow-up redirects from downstream routes.
 *
 * Untrusted `redirectTo` query values are normalized to root-relative internal
 * paths only, so external or protocol-relative URLs cannot be used as open
 * redirects.
 */
export const resolvePostLoginRedirect = ({
	invitationRedirectPath,
	redirectToParam,
	redirectAfterSignIn,
}: ResolvePostLoginRedirectInput): string => {
	if (invitationRedirectPath) {
		return getSafeRedirectPath(invitationRedirectPath, "/");
	}

	const defaultRedirect =
		authConfig.organizations.enable && authConfig.organizations.requireOrganization
			? "/"
			: getSafeRedirectPath(redirectAfterSignIn, "/");

	return getSafeRedirectPath(redirectToParam, defaultRedirect);
};
