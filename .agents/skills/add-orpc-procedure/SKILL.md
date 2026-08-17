---
name: add-orpc-procedure
description: "Use when implementing a typed oRPC endpoint with route metadata, Zod 4 contracts, authorization context, and TanStack Vue Query consumption."
---

# Add an oRPC procedure

## Scope

Use for RPC/OpenAPI operations under `packages/api/modules`. Do not access the database from Vue or create a Nuxt server route for shared API behavior.

## Procedure

1. Add `packages/api/modules/<domain>/procedures/<verb-noun>.ts`; choose `publicProcedure`, `protectedProcedure`, or `adminProcedure` from `packages/api/orpc/procedures.ts`.
2. Chain `.route(...)`, `.input(...)` when needed, `.output(...)`, and `.handler(...)`. Supply HTTP method/path, tags, summary, description, and Zod 4 boundary validation.
3. Put database operations in `packages/database/prisma/queries/`.
4. Enforce object authorization. `protectedProcedure` authenticates but does not authorize an organization; check membership before tenant data access.
5. Export from `packages/api/modules/<domain>/router.ts`; add a new domain once to `packages/api/orpc/router.ts`.
6. Consume with `useORPC()` and auto-imported `useQuery`/`useMutation`; follow `apps/saas/modules/shared/components/NotificationCenter.vue` for reactive query options.
7. Add a colocated Vitest test using `call()` and mocks. Run `pnpm --filter @repo/api test`, format, lint, and type-check.

Canonical reference: `packages/api/modules/organizations/procedures/generate-organization-slug.ts` has route metadata, schemas, and a typed handler.

## Done

The router exposes the procedure, invalid/unauthorized input fails, output matches its schema, and direct-call tests pass.

## Common mistakes

- Assuming authentication proves organization membership.
- Returning undeclared output fields.
- Bypassing TanStack Query for ordinary cached client reads.
