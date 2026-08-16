import { createPermissionRules, type PermissionsDefinition } from "@repo/permissions";
import type { Permix } from "permix";
import { usePermix } from "permix/vue";

/**
 * Access the per-app Permix instance provided by `plugins/permix.ts`.
 */
export function usePermissions() {
	const { $permix } = useNuxtApp();
	return usePermix($permix as Permix<PermissionsDefinition>);
}

/**
 * Keep client/server rules in sync with the current user and active org membership.
 * Call from authenticated layouts so `check()` / `isReady` work during SSR and hydration.
 */
export function useSetupPermissions() {
	const { $permix } = useNuxtApp();
	const permix = $permix as Permix<PermissionsDefinition>;
	const { user } = useSession();
	const { activeOrganizationUserRole } = useActiveOrganization();

	watchEffect(() => {
		permix.setup(
			createPermissionRules({
				user: user.value,
				membershipRole: activeOrganizationUserRole.value,
			}),
		);
	});

	return usePermix(permix);
}
