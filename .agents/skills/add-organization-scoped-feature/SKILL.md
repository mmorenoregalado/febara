---
name: add-organization-scoped-feature
description: "Use when implementing tenant-scoped routes, oRPC authorization, queries, cache keys, and active-organization behavior."
---

# Add an organization-scoped feature

## Scope

Use when ownership or permissions belong to an organization. Do not infer authorization from browser active state or client `organizationId` alone.

## Procedure

1. Put organization URLs under `apps/saas/pages/(authenticated)/[organizationSlug]/` and use `definePageMeta({ layout: "app" })`. Add the typed `requiresActiveOrganization: true` meta when the page must force tenant selection even if `authConfig.organizations.requireOrganization` is false; `apps/saas/layouts/app.vue` consumes it.
2. Read state through `useActiveOrganization()`; do not duplicate session/slug resolution.
3. Accept the minimum organization identifier in oRPC and authenticate with `protectedProcedure`.
4. Authorize every operation with `verifyOrganizationMembership` in `packages/api/modules/organizations/lib/membership.ts`, adding a stricter `checkPermission(...)` call when the operation needs more than plain membership. Return `FORBIDDEN` before reading or mutating the requested feature resource.
5. Filter every database read/write by organization; never fetch by record ID alone and rely on UI checks.
6. Include organization identity in TanStack Query inputs and disable queries until IDs exist. Follow `useActiveOrganizationQuery` in `apps/saas/modules/organizations/lib/api.ts`.
7. Test member success and cross-organization denial, asserting no mutations for denied users; run API tests and SaaS E2E when visible.

Canonical references: `apps/saas/pages/(authenticated)/[organizationSlug]/settings.vue` resolves active organization/admin state; `packages/api/modules/organizations/procedures/create-logo-upload-url.ts` verifies membership before mutating an organization resource.

## Done

Routes, API, and database enforce the same tenant boundary; switching organizations cannot reuse stale data; denial tests pass.

## Common mistakes

- Treating `protectedProcedure` as tenant authorization.
- Trusting `session.activeOrganizationId` for requested resources.
- Sharing cache entries across organization IDs.
