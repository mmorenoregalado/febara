import type { PermissionsDefinition } from "@repo/permissions";
import { createPermix } from "permix";

import { defineNuxtPlugin } from "#imports";

/**
 * Create a Permix instance per Nuxt app (per request on the server, once in the
 * browser). Avoids a module-scope singleton that would leak rules across users.
 */
export default defineNuxtPlugin(() => {
	const permix = createPermix<PermissionsDefinition>();

	return {
		provide: {
			permix,
		},
	};
});
