# AGENTS.md

This file applies to the whole `pokedex-manager` repository.
Mirror existing conventions and prefer nearby canonical implementations.
Explicit user instructions win; if a documented command fails, report it rather than inventing a workaround.

## Stack

- Nuxt 4, Vue 3, TypeScript, Node.js 22+, and pnpm workspaces
- Turborepo, oRPC, Hono, Better Auth, and Prisma
- Tailwind CSS, Nuxt UI, and Reka UI
- TanStack Vue Query, Zod 4, `@nuxtjs/i18n`, VueUse, Vitest, Playwright, Oxlint, and Oxfmt

## Setup & verification

### Environment

Copy `.env.local.example` to `.env.local`. For local boot, set `DATABASE_URL` to
`postgresql://postgres:postgres@localhost:5432/pokedex_manager` and keep the local
`NUXT_PUBLIC_*` URLs from the example. `MAIL_FROM` is required for most mail
providers; OAuth, storage, mail, and AI variables are only needed when
using those integrations.

Start the local services with:

```bash
docker compose up -d postgres
```

The `postgres` service is PostgreSQL 16 on port 5432. The compose file also defines
MinIO (`minio` and `minio-setup`) for S3-compatible storage when storage features are used.

### Install and run

```bash
pnpm install
pnpm dev
```

`pnpm dev` runs the workspace dev tasks through Turbo.

### Root commands

| Command                             | Purpose                                       |
| ----------------------------------- | --------------------------------------------- |
| `pnpm dev`                          | Start development tasks                       |
| `pnpm build`                        | Build the workspace                           |
| `pnpm start`                        | Alias for `pnpm dev`                          |
| `pnpm lint`                         | Generate the database client, then run Oxlint |
| `pnpm lint:fix`                     | Fix Oxlint issues                             |
| `pnpm format` / `pnpm format:check` | Write / check Oxfmt formatting                |
| `pnpm type-check`                   | Run workspace type checks                     |
| `pnpm test`                         | Run Vitest workspace tests                    |
| `pnpm clean`                        | Clear Turbo outputs                           |

Required gates:

1. After every meaningful change, run `pnpm format` and `pnpm lint`.
2. Before every commit, run `pnpm type-check`.
3. Run the relevant tests before considering the change complete.

The root test task runs Vitest in `packages/api` and `packages/utils`.
Playwright tests are in `apps/marketing/e2e` and `apps/saas/e2e`. E2E scripts are
per app: use `pnpm --filter marketing e2e`, `pnpm --filter marketing e2e:ci`,
`pnpm --filter saas e2e`, or `pnpm --filter saas e2e:ci`. E2E requires a running
application and database; there are no root `e2e` or `e2e:ci` scripts.

## Monorepo map

```text
apps/
├── docs/          # VitePress documentation
├── mail-preview/  # Maizzle email preview
├── marketing/     # Public site
└── saas/          # Authenticated product
packages/
├── ai/
├── api/
├── auth/
├── database/
├── i18n/
├── logs/
├── mail/
├── notifications/
├── permissions/ # Permix definitions + rule builder
├── storage/
├── ui/
└── utils/
tooling/
├── scripts/
├── tailwind/
└── typescript/
```

## Imports & path aliases

`@repo/*` and `@repo/ui/*` are pnpm workspace package names. They are not
TypeScript, Vite, or Nuxt path mappings. Use package exports such as
`@repo/auth`, `@repo/database`, and `@repo/i18n/config`.

Nuxt provides `~/` and `@/` as app-root aliases. The app `nuxt.config.ts` files
also configure auto-import directories and component directories; they do not
define `@repo/*` aliases.

| Built-in alias | Meaning  |
| -------------- | -------- |
| `~/`           | App root |
| `@/`           | App root |

Auto-imports are configured in each app's `nuxt.config.ts`:

- `modules/**/composables/**`
- `modules/**/lib/**`
- `modules/**/utils/**`
- Vue/Nuxt built-ins such as `ref`, `computed`, `watch`, and `navigateTo`
- `useQuery`, `useMutation`, and `useQueryClient` from TanStack Vue Query
- `z` from Zod

Components under `modules/` and `@repo/ui/components` are auto-registered.
The component roots are `@/modules` and `node_modules/@repo/ui/components`,
with `pathPrefix: false` and Vue extensions in both app configs.
The auto-import directories are configured in `apps/saas/nuxt.config.ts` and
`apps/marketing/nuxt.config.ts`; keep feature composables in those directories.
Translations use `../../../packages/i18n/translations` as the configured `langDir`.

## API & data layer

oRPC modules live under `packages/api/modules`. Procedures use `publicProcedure`,
`protectedProcedure`, or `adminProcedure`, with route metadata, Zod input validation,
middleware, and a handler. Follow `packages/api/modules/organizations/procedures/`.

Keep database access in `packages/database`. Prisma owns the schema, migrations, and
query implementations. The database package scripts are:

```bash
pnpm --filter @repo/database generate
pnpm --filter @repo/database push
pnpm --filter @repo/database migrate
pnpm --filter @repo/database studio
```

Edit `packages/database/prisma/schema.prisma` for Prisma schema changes, then use
the appropriate database command. Do not hand-edit generated Prisma client output
or `packages/database/prisma/zod/index.ts`.

Nuxt generates `.nuxt/` during app preparation and builds; do not hand-edit it.

### Notifications

Create server-side notifications with `createNotification` from
`packages/notifications/src/create-notification.ts`. Types and kinds live in
`packages/notifications/src/types.ts`, and the settings catalog lives in
`packages/notifications/src/catalog.ts`; keep the database enum, catalog, and i18n labels in sync.

For client data fetching, use `useORPC()` and TanStack Vue Query. Follow
`apps/saas/modules/shared/composables/use-orpc.ts`.

### Client cache invalidation

After every successful mutation that affects a list or detail query—whether
oRPC, `authClient`, or any other write—invalidate the matching TanStack Query
keys before showing success UI. Do not rely on a full page reload.

- Prefer `queryClient.invalidateQueries({ queryKey: orpc.<module>.list.key() })`
  for oRPC lists. Prefix keys refresh every filtered/paginated page.
- For non-oRPC lists, invalidate the same key the list query uses (for example
  `organizationListQueryKey`, `userPasskeyQueryKey`, `["active-sessions"]`).
- When one mutation changes multiple cached views, invalidate every affected key
  (admin org updates also refresh `organizationListQueryKey`; invitation revoke
  refreshes both `fullOrganizationQueryKey` and `activeOrganizationQueryKey`).
- Canonical examples: admin user delete in
  `apps/saas/modules/admin/components/AdminUserListActionsCell.vue`, invitation
  revoke in `OrganizationInvitationsList.vue`, and passkey CRUD in
  `Passkeys.vue`.

## Framework patterns

- Prefer Nuxt SSR and composables over duplicated client-side logic.
- Keep reusable logic in `modules/**/composables`, feature helpers in `lib` or `utils`.
- Use Nuxt server routes under `server/api` and `server/routes` for server-only logic.
- Use `navigateTo`, `<NuxtLink>`, `useRoute`, and `useRouter` for navigation.
- Keep the auto-import configuration above in mind before adding explicit imports.

## Auth & multi-tenancy

- Use `useSession()` and `useAuthClient()` from the auth composables.
- Scope organization data with `useActiveOrganization()`.
- When changing auth flows, update relevant templates under `packages/mail/emails`,
  preserve audit hooks, and verify locale handling.

Canonical examples:
`apps/saas/modules/auth/composables/use-session.ts` and
`apps/saas/modules/organizations/composables/use-active-organization.ts`.

## Permissions (Permix)

- Definitions and rule builder: `@repo/permissions` (`createPermissionRules`,
  `checkPermission`, `PermissionsDefinition`).
- oRPC: `packages/api/orpc/permix.ts` + permissions attached in
  `packages/api/orpc/procedures.ts`.
- SaaS: `apps/saas/plugins/permix.ts` creates a **per-app** instance (never a
  module-scope singleton on Nitro). Wrap with `PermixProvider` in `app.vue`.
- Use `useSetupPermissions()` / `usePermissions()` from
  `apps/saas/modules/shared/composables/use-permissions.ts`.
- Prefer `checkPermission(...)` / `usePermissions().check(...)` over
  `isOrganizationAdmin` and inline `role === "..."` comparisons. Keep
  `@repo/auth/lib/helper` wrappers only for backwards compatibility.
- For user-scoped gates like `admin.access`, prefer `checkPermission({ user })`
  after the session is loaded so the gate does not depend on `setup()` /
  `isReady` timing.
- Better Auth `organization.*` client endpoints are not covered by Permix.

## UI, forms, and i18n

- Use Nuxt UI components; its current primitive dependency is Reka UI.
- Use Nuxt UI `<UForm>` with Zod. Follow
  `apps/saas/modules/auth/components/LoginForm.vue`.
- Use the typed `useTranslations()` wrappers in
  `apps/saas/modules/shared/composables/use-translations.ts` and
  `apps/marketing/modules/shared/composables/use-translations.ts`.
- Locale files live under `packages/i18n/translations`; strategies and cookie
  configuration are in each app's `nuxt.config.ts` and `packages/i18n/config.ts`.
- Document titles use `useHead({ titleTemplate })` in each app `app.vue`:
  `{page} – {runtimeConfig.public.appName}` (en dash). Set `useSeoMeta({ title })`
  on every SaaS page. An empty title (marketing homepage) shows the product name
  alone.

## Config & environment variables

Keep server-only variables unprefixed. Browser-visible Nuxt variables use
`NUXT_PUBLIC_`. Use `.env.local` for local secrets and never commit it. Runtime
configuration belongs in the relevant app's `nuxt.config.ts`.

## Dependencies & supply chain

`pnpm-workspace.yaml` sets `minimumReleaseAge: 1440`; installing a release younger
than 24 hours can fail. Use existing `catalog:` versions where available and add
dependencies to the workspace package that imports them.

## Change management

- Use conventional commits such as `feat:`, `fix:`, `docs:`, or `refactor:`.
- Update `CHANGELOG.md` for consumer-impacting changes.
- Update `AGENTS.md` when conventions, aliases, scripts, or app boundaries change.
- Keep changes generic and consistent across apps/packages.

## Before you're done

- [ ] `pnpm format` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm type-check` passes
- [ ] Relevant tests pass
- [ ] No `console.log` statements were added
- [ ] No unjustified `any` types were added
- [ ] User-facing strings have translations
- [ ] Relevant docs and `CHANGELOG.md` are updated

More documentation: apps/docs
