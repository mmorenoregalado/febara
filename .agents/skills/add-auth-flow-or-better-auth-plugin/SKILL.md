---
name: add-auth-flow-or-better-auth-plugin
description: "Use when extending Better Auth server hooks/plugins, Vue auth clients, login flows, user fields, or auth-generated schema."
---

# Add an auth flow or Better Auth plugin

## Scope

Use for authentication and account lifecycle. Do not use ad hoc cookies or bypass `packages/auth/auth.ts`.

## Procedure

1. Inspect `packages/auth/auth.ts`, flags in `packages/auth/config.ts`, and client plugin lists in `packages/auth/client.ts` and `apps/saas/modules/auth/composables/use-auth-client.ts`.
2. Add server plugins to `auth.plugins` and matching client plugins to both Vue clients when client methods exist. Follow `packages/auth/plugins/invitation-only/index.ts` for a custom `BetterAuthPlugin`.
3. Preserve trusted origins, locale extraction, logging, cleanup, organization seat hooks, and localized mail callbacks.
4. Update Vue flows under `apps/saas/modules/auth/`; use `useAuthClient`, `useSession`, `sessionQueryKey` invalidation, Nuxt navigation, `UForm`, and Zod.
5. Run `pnpm --filter @repo/auth migrate` for auth-owned schema changes. The command writes the Prisma source at `packages/database/prisma/schema.prisma`; review that diff for application fields, mirror all three Drizzle dialect schemas and both query layers, then run `pnpm --filter @repo/database generate`. Never edit generated client/Zod output.
6. Add all locale strings and update `packages/mail/emails/` templates when the flow mails users.
7. Test hooks/procedures with Vitest and user flows in `apps/saas/e2e/auth.spec.ts`; run root gates.

Canonical references: `packages/auth/auth.ts` wires server hooks/plugins; `packages/auth/client.ts` and `apps/saas/modules/auth/composables/use-auth-client.ts` contain the two matching Vue client plugin lists.

## Done

Server/client plugin contracts match, schema/mail side effects remain intact, session caches refresh, and auth tests pass.

## Common mistakes

- Registering a plugin on only one side or one client.
- Trusting wildcard callback origins.
- Accepting auth-generated schema without reviewing app fields.
