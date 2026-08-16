import type { PermissionsDefinition } from "@repo/permissions";
import type { Permix } from "permix";

declare module "#app" {
	interface NuxtApp {
		$permix: Permix<PermissionsDefinition>;
	}
}

declare module "vue" {
	interface ComponentCustomProperties {
		$permix: Permix<PermissionsDefinition>;
	}
}

export {};
