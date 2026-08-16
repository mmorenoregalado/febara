import type { ValidateDefinition } from "permix";

/**
 * Central permission schema for the SaaS app and oRPC API.
 *
 * Semantics preserve the pre-Permix role checks:
 * - `admin.access` — global platform admin (`user.role === "admin"`)
 * - `organization.read` — any organization member
 * - `organization.manage` — organization owner/admin, or global admin
 * - `organization.delete` — organization owner only
 */
export type PermissionsDefinition = ValidateDefinition<{
	admin: ["access"];
	organization: ["read", "manage", "delete"];
}>;

export type OrganizationMemberRole = "owner" | "admin" | "member";
