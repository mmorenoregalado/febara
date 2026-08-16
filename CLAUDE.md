# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Start here

This repo has an extensive **`AGENTS.md`** at the repository root — read it. It covers import aliases, auto-import
directories, the oRPC/database conventions, permissions, cache invalidation rules, i18n, and the required
pre-commit gates in detail. **`.agents/skills/`** has one markdown file per common task (adding an oRPC procedure,
a database schema change, a feature module, a notification, translations, etc.) — check there
before starting a task that matches one of those shapes; they name the canonical file to copy patterns from.

This file adds command references and an architecture overview that complement (not repeat) `AGENTS.md`.

## What this is

PokeDex Manager — a Nuxt 4 / Vue 3 SaaS starter monorepo (`pnpm` workspaces + Turborepo). Node.js 22+, TypeScript,
oRPC, Hono, Better Auth, Prisma + Drizzle, Tailwind CSS v4, Nuxt UI, TanStack Vue Query, Zod 4, Vitest, Playwright,
Oxlint, and Oxfmt.

## Commands

Local services (Postgres 16 + MinIO S3) via Docker Compose:

```bash
docker compose up -d          # or: docker compose up -d postgres
cp .env.local.example .env.local
pnpm install
pnpm --filter @repo/database push   # sync schema to a disposable local DB
pnpm dev                            # saas :3000, marketing :3001, docs :3002
```

Root scripts (run from repo root, powered by Turbo):

| Command                             | Purpose                                                            |
| ----------------------------------- | ------------------------------------------------------------------ |
| `pnpm dev`                          | Start all app dev servers (`turbo dev`)                            |
| `pnpm build`                        | Build the workspace                                                |
| `pnpm lint`                         | Generate the database client, then run Oxlint                      |
| `pnpm lint:fix`                     | Fix Oxlint issues                                                  |
| `pnpm format` / `pnpm format:check` | Write / check Oxfmt formatting                                     |
| `pnpm type-check`                   | Run workspace type checks (`turbo type-check`)                     |
| `pnpm test`                         | Run Vitest across the workspace (`packages/api`, `packages/utils`) |
| `pnpm clean`                        | Clear Turbo outputs                                                |

Required gates before considering a change done: `pnpm format`, `pnpm lint`, `pnpm type-check`, and relevant tests.

**Single-package / single-test workflows** (each package under `packages/*` and `apps/*` exposes its own scripts —
use `pnpm --filter <name> <script>`, e.g. `pnpm --filter @repo/api ...`, `pnpm --filter saas ...`):

```bash
pnpm --filter @repo/api test                          # run all Vitest tests in packages/api
pnpm --filter @repo/api test -- stream-message         # filter by test file/name substring
pnpm --filter @repo/api test -- run path/to/file.test.ts
pnpm --filter @repo/utils test
pnpm --filter saas type-check                          # nuxi typecheck for one app
pnpm --filter saas e2e                                 # Playwright UI mode (needs app + DB running)
pnpm --filter saas e2e:ci                              # headless Playwright, installs chromium first
pnpm --filter marketing e2e / e2e:ci
```

There are no root `e2e`/`e2e:ci` scripts — Playwright tests live per-app in `apps/marketing/e2e` and `apps/saas/e2e`
and need a running app and database. Vitest config for `packages/api`, `packages/permissions`, and `packages/utils`
is plain `{ globals: true, environment: "node" }` — no DOM/component test harness exists.

Database package (`packages/database`):

```bash
pnpm --filter @repo/database generate   # regenerate Prisma client + zod schemas
pnpm --filter @repo/database push       # push schema.prisma to a disposable local DB
pnpm --filter @repo/database migrate    # prisma migrate dev — durable migration
pnpm --filter @repo/database studio     # Prisma Studio
```

## Architecture

### Monorepo shape

- `apps/saas` — the authenticated product (Nuxt 4, port 3000).
- `apps/marketing` — public site (Nuxt 4, port 3001).
- `apps/docs` — VitePress documentation (port 3002).
- `apps/mail-preview` — Maizzle-based local preview for the HTML email templates in `packages/mail/emails`.
- `packages/*` — shared, workspace-installed logic (`@repo/*`), each independently type-checked/built.
- `tooling/*` — shared TypeScript base config, Tailwind theme, and CLI scripts.

`@repo/*` names are pnpm workspace packages, not path mappings — always import via package exports
(`@repo/auth`, `@repo/database`, `@repo/i18n/config`, …), never invent an alias. Nuxt-side `~/`/`@/` resolve to
each app's own root.

### API layer: oRPC modules

`packages/api/modules/<domain>/{procedures,router.ts}` define typed RPC/OpenAPI endpoints. Every domain router is
registered once in `packages/api/orpc/router.ts`. Procedures come in three tiers defined in
`packages/api/orpc/procedures.ts`:

- `publicProcedure` — no auth, just a `{ headers }` context.
- `protectedProcedure` — requires a Better Auth session; also resolves the caller's organization membership role
  (from `session.activeOrganizationId`) and sets up Permix permission context. **Authenticating does not prove
  organization authorization** — procedures touching tenant data must still check membership/permissions.
- `adminProcedure` — `protectedProcedure` + a Permix `admin.access` check.

Apps consume the router through `useORPC()` + auto-imported TanStack Vue Query (`useQuery`/`useMutation`), per
`apps/saas/modules/shared/composables/use-orpc.ts`.

### Database: Prisma + Drizzle, dual but asymmetric

`packages/database/prisma/schema.prisma` is the single source of truth for the schema and for migrations
(`prisma migrate dev`, `prisma db push`). `packages/database/drizzle/schema/{postgres,mysql,sqlite}.ts` is a
parallel, hand-maintained query implementation kept _semantically_ (not textually) in sync — it exists as a
swappable alternative, not as the migration path (there is no Drizzle-Kit migration command wired up).

Currently `packages/database/index.ts` re-exports only the **Prisma** implementation
(`packages/database/prisma/{client,queries,zod}.ts`); the Drizzle query layer (`packages/database/drizzle/queries/`)
mirrors the same function names/signatures but isn't the active export. When changing a model or an exported
query, update the Prisma source, mirror it in all three Drizzle dialect files, and keep both `queries/<domain>.ts`
implementations aligned — see `.agents/skills/database-schema-change/SKILL.md`. Never hand-edit
`packages/database/prisma/generated/` or `packages/database/prisma/zod/index.ts` (regenerate instead).

### Permissions: Permix

`packages/permissions/definition.ts` declares the permission schema (`admin.access`,
`organization.{read,manage,delete}`) and `create-permission-rules.ts` builds the
rule set from a user + membership role. `packages/api/orpc/permix.ts` and `procedures.ts` wire it into the oRPC
context. On the SaaS app, `apps/saas/plugins/permix.ts` creates a **per-app** Permix instance (never a module-scope
singleton, since Nitro is multi-request) wrapped by `PermixProvider` in `app.vue`; use
`useSetupPermissions()`/`usePermissions()`. Prefer `checkPermission(...)` over role-string comparisons. Better
Auth's own `organization.*` client endpoints are not covered by Permix.

### Pluggable integration packages

`packages/{mail,storage,ai}` each follow the same shape: a `config.ts` picks a provider, and
`provider/index.ts` exposes a common interface behind multiple swappable implementations selected via env vars:

- `packages/mail/provider/` — resend, postmark, mailgun, nodemailer, console (dev fallback).
- `packages/storage/provider/` — S3-compatible (used locally via MinIO).
- `packages/ai/` — Vercel AI SDK wrapper (`@ai-sdk/anthropic`, `@ai-sdk/openai`).

Email templates are static PostHTML in `packages/mail/emails/*.html`, rendered with Maizzle **5.x** (pinned —
Maizzle 6 can't render these templates; see `pnpm-workspace.yaml` catalog comment) and previewable via
`apps/mail-preview`.

### Auth & multi-tenancy

`packages/auth` wraps Better Auth (`auth.ts`, `config.ts`, `client.ts`, `plugins/`, including an invitation-only
plugin). Organizations are the tenancy boundary; a session carries an `activeOrganizationId` that
`protectedProcedure` resolves into a membership role. Client-side, use `useSession()`, `useAuthClient()`, and
`useActiveOrganization()`.

### Notifications

`packages/notifications/src/create-notification.ts` creates server-side notifications; `types.ts` defines
kinds/types and `catalog.ts` is the settings catalog. The database enum, the catalog, and i18n labels must all
stay in sync when adding a notification kind (see `.agents/skills/add-a-notification/SKILL.md`).

### i18n

Locale JSON lives in `packages/i18n/translations/{en,de,es,fr}/{saas,marketing}.json` (`langDir` is configured in
each app's `nuxt.config.ts`). Every visible string needs all four locale variants, consumed through each app's
typed `useTranslations()` wrapper (not raw `@nuxtjs/i18n` calls).

### Nuxt app conventions

Both `apps/saas` and `apps/marketing` auto-import from `modules/**/{composables,lib,utils}` and auto-register
`.vue` components under `modules/**` and `@repo/ui/components` (no path prefix) — configured per-app in
`nuxt.config.ts`. Keep server-only logic in `server/api`/`server/routes` (Nitro); never call database/provider
code from Vue components directly.

## Environment variables

Server-only vars are unprefixed; browser-visible ones use `NUXT_PUBLIC_`. `.env.local` holds local secrets (never
commit it). `NUXT_PUBLIC_SAAS_URL` is the canonical base URL for auth/API/the SaaS app. OAuth, storage,
mail-provider, and AI vars are only required when that specific integration is enabled — see
`.env.local.example` for the full set grouped by feature.

## Supply chain

`pnpm-workspace.yaml` sets `minimumReleaseAge: 1440` (24h) — installing a package release younger than that can
fail. Use existing `catalog:` versions where available; add new dependencies to the workspace package that
actually imports them, not the root.
