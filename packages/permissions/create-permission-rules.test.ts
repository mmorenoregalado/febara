import { describe, expect, it } from "vitest";

import { checkPermission } from "./check-permission";
import { createPermissionRules } from "./create-permission-rules";

/**
 * Matrix mirrors the pre-Permix semantics from:
 * - packages/auth/lib/helper.ts (isOrganizationAdmin / isOrganizationOwner)
 * - packages/api/orpc/procedures.ts (adminProcedure)
 * - org-scoped procedure role gates
 */
describe("createPermissionRules matrix", () => {
	it.each([
		{
			label: "global admin without membership",
			user: { role: "admin" },
			membershipRole: null,
			expected: {
				adminAccess: true,
				organizationRead: false,
				organizationManage: true,
				organizationDelete: false,
			},
		},
		{
			label: "organization owner",
			user: { role: "user" },
			membershipRole: "owner",
			expected: {
				adminAccess: false,
				organizationRead: true,
				organizationManage: true,
				organizationDelete: true,
			},
		},
		{
			label: "organization admin",
			user: { role: "user" },
			membershipRole: "admin",
			expected: {
				adminAccess: false,
				organizationRead: true,
				organizationManage: true,
				organizationDelete: false,
			},
		},
		{
			label: "organization member",
			user: { role: "user" },
			membershipRole: "member",
			expected: {
				adminAccess: false,
				organizationRead: true,
				organizationManage: false,
				organizationDelete: false,
			},
		},
		{
			label: "unauthenticated / no membership",
			user: null,
			membershipRole: null,
			expected: {
				adminAccess: false,
				organizationRead: false,
				organizationManage: false,
				organizationDelete: false,
			},
		},
		{
			label: "global admin who is also an organization member",
			user: { role: "admin" },
			membershipRole: "member",
			expected: {
				adminAccess: true,
				organizationRead: true,
				organizationManage: true,
				organizationDelete: false,
			},
		},
	] as const)("$label", ({ user, membershipRole, expected }) => {
		const rules = createPermissionRules({ user, membershipRole });

		expect(rules.admin.access).toBe(expected.adminAccess);
		expect(rules.organization.read).toBe(expected.organizationRead);
		expect(rules.organization.manage).toBe(expected.organizationManage);
		expect(rules.organization.delete).toBe(expected.organizationDelete);

		expect(checkPermission({ user, membershipRole }, "admin.access")).toBe(expected.adminAccess);
		expect(checkPermission({ user, membershipRole }, "organization.read")).toBe(
			expected.organizationRead,
		);
		expect(checkPermission({ user, membershipRole }, "organization.manage")).toBe(
			expected.organizationManage,
		);
		expect(checkPermission({ user, membershipRole }, "organization.delete")).toBe(
			expected.organizationDelete,
		);
	});
});
