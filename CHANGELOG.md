# Changelog

Notable changes to this repository are documented here from now on.

## 2026-08-15

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.65`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1110.0`, `better-auth`, `@better-auth/core`, and `@better-auth/passkey` to `1.6.28`, `@scalar/hono-api-reference` to `^0.11.14`, `hono` to `^4.13.2`, `dodopayments` to `^2.46.0`, `resend` to `^6.20.0`, and `typescript-native-bridge` to `6.0.3-bridge.13.tsgo.7.0.2`. Skipped `@maizzle/framework` 6.x (incompatible with PostHTML email templates), `mail-preview` `tailwindcss` 3.x (intentional for email preview), `oxfmt` 0.57+ (CSS parse regression), docs `vite` `8.x` (pinned to vite 7 for vitepress/Nuxt peer compatibility), `@nuxt/devtools` `4.0.0-alpha.*` (pre-release), and `h3` `2.0.0-rc.*` (pre-release). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

## 2026-08-14

### Changed

#### Dependencies

- **Production dependencies**: Bumped `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1109.0`. Skipped `@maizzle/framework` 6.x (incompatible with PostHTML email templates), `mail-preview` `tailwindcss` 3.x (intentional for email preview), `oxfmt` 0.57+ (CSS parse regression), docs `vite` `8.x` (pinned to vite 7 for vitepress/Nuxt peer compatibility), `@nuxt/devtools` `4.0.0-alpha.*` (pre-release), and `h3` `2.0.0-rc.*` (pre-release). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

## 2026-08-13

### Fixed

#### Vercel

- **SaaS builds**: Ignore stale missing dependency links during Nitro tracing on Vercel.

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.62`, `@ai-sdk/anthropic` to `^4.0.38`, `@ai-sdk/openai` to `^4.0.40`, `better-auth`, `@better-auth/core`, and `@better-auth/passkey` to `1.6.27`, and `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1108.0`. Skipped `@maizzle/framework` 6.x (incompatible with PostHTML email templates), `mail-preview` `tailwindcss` 3.x (intentional for email preview), `oxfmt` 0.57+ (CSS parse regression), docs `vite` `8.x` (pinned to vite 7 for vitepress/Nuxt peer compatibility), `@nuxt/devtools` `4.0.0-alpha.*` (pre-release), and `h3` `2.0.0-rc.*` (pre-release). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

#### Mail templates

- **Layout**: The shared email layout is a bit wider (640px) with more padding and 18px body copy, so transactional emails are less cramped. The primary button matches that scale.

#### Page titles

- **Document title**: Marketing and SaaS now use `{page} – {appName}` (en dash) instead of a pipe, and the product name comes from `runtimeConfig.public.appName`. Every SaaS page sets a title so tabs read like `Welcome back – PokeDex Manager` rather than the product name alone.

#### Marketing redesign

- **Typography**: Marketing uses Inter for body copy and DM Sans for headlines (including the wordmark). `text-balance` is only on centered headlines and subtitles. The SaaS app uses Inter throughout.
- **Color scheme**: Shared tokens sit on Tailwind’s olive scale—warm olive-50 paper, olive-tinted borders, and olive-950 actions—so the high-contrast ink look picks up a quiet color, in the same family as the Oatmeal olive theme.
- **Marketing visual language**: Refreshed the public site toward a quieter Linear/Notion-like layout with UserJot-inspired structure—more vertical air, a left-aligned hero, stacked section titles with the lede underneath, a single bordered pricing table, and shared medium-weight page headers across blog, changelog, contact, and legal pages. A chromatic olive-green touch color is used like UserJot’s orange: a “New” pill, section labels, larger unboxed icons, checks, and secondary links. Scroll reveals and hero fade-ins are gone.
- **Landing sections**: Added testimonials and a closing CTA band on the marketing homepage, with richer example copy across marketing locales plus clearer shared pricing descriptions.
- **Visual polish**: Hero uses a live dashboard wireframe (sidebar, stats, placeholder) instead of screenshots, feature placeholders are CSS product frames with dummy portraits and plan icons, testimonials include example headshots, pricing leads with the amount, and the newsletter is a compact closer instead of a second CTA.
- **Logo**: Replaced the layered hex SVG with a stacked three-bar Acme mark (thin rounded bars forming a pyramid) and a semibold wordmark in the shared `Logo` component.

#### UI

- **Alerts**: Feedback alerts use `rounded-xl`. Success, error, and warning now use Tailwind `green-800`/`green-400`, `red-700`/`red-400`, and `yellow-700`/`yellow-500` instead of the default 500-level green, red, and yellow.
- **Form controls**: Inputs, selects, and textareas use `rounded-xl` so their corners sit closer to the pill buttons and other rounder surfaces.
- **Logo**: The middle bar of the shared Acme mark uses the chromatic olive touch color.
- **App icon**: Replaced the rocket `icon.png` in marketing, SaaS, and docs with the three-bar Acme mark. The middle bar uses the chromatic olive touch color.
- **SaaS touch color**: The chromatic olive is used as a state hint in the product: active nav icons, settings/tab underlines, checked switches, unread notification badges, active/recommended plans, the chat send control, and organization logo placeholders.
- **Docs typography**: The docs app now uses the same pairing as marketing—Inter for body copy and DM Sans for headings and the wordmark.
- **Color mode toggle**: Restyled the marketing and SaaS pickers as a pill with a sliding indicator. Apps keep translated labels locally so the UI package stays free of `@repo/i18n`. The active option no longer uses a drop shadow.
- **Locale switch**: Ghost icon button with an accessible language label. Marketing and SaaS keep app-local pickers.
- **Feature headlines**: Product feature spreads no longer show an icon above the top-level title; the three-up benefit grid still does.
- **Inner pages**: Blog, changelog, and contact use the same left-aligned header as the homepage (olive eyebrow, stacked title and lede). Changelog is a dated timeline with six example releases; the journal has product-shaped sample posts.
- **Marketing container**: The marketing `container` max-width steps down from `7xl` to `6xl` so the public pages sit a bit narrower.
- **SaaS logo**: The authenticated app and auth screens show only the three-bar mark, without the Acme wordmark.
- **Blog covers**: Each sample journal post now has a product-frame cover. The list shows it to the left of the title at full container width; the article page already used the same `image` field.
- **Blog tags**: The journal list filters with `?tag=`. Tags on the list and article pages are links; the active tag (or All) clears the query.
- **Hero grid**: Removed the faint grid overlay from the marketing hero.
- **Trial copy**: FAQ and the billing journal post now say 7-day trials, matching `trialPeriodDays` in the payments config.
- **Hero highlights**: Removed the Authentication / Organizations / Billing row under the homepage preview.
- **Headline wrapping**: Left-aligned headlines and subtitles use `text-pretty` so the last line is less likely to leave a single word hanging. Centered headings still use `text-balance`.
- **Homepage sections**: Slightly tighter vertical padding so features, testimonials, pricing, FAQ, and the CTA sit closer together.
- **Production SSR**: Nuxt apps now declare one shared Vue version, and the marketing server bundles Unhead so traced Vercel and `node-server` output cannot mix runtime versions or omit SSR entrypoints.

---

## 2026-08-12

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.59`, `@ai-sdk/anthropic` to `^4.0.37`, `@ai-sdk/openai` to `^4.0.37`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1107.0`, `@iconify-json/lucide` to `^1.2.123`, `@nuxt/icon` to `^2.5.0`, `@nuxtjs/seo` to `5.3.12`, `use-intl` to `^4.13.6`, `resend` to `^6.19.0`, and `stripe` to `^22.5.0`. Skipped `@maizzle/framework` 6.x (incompatible with PostHTML email templates), `mail-preview` `tailwindcss` 3.x (intentional for email preview), `oxfmt` 0.57+ (CSS parse regression), docs `vite` `8.x` (pinned to vite 7 for vitepress/Nuxt peer compatibility), `@nuxt/devtools` `4.0.0-alpha.*` (pre-release), and `h3` `2.0.0-rc.*` (pre-release). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `oxlint` to `1.78.0`.

---

## 2026-08-11

### Changed

#### Dependencies

- **Production dependencies**: Bumped `@nuxtjs/seo` to `5.3.11`. Skipped `@maizzle/framework` 6.x (incompatible with PostHTML email templates), `mail-preview` `tailwindcss` 3.x (intentional for email preview), `oxfmt` 0.57+ (CSS parse regression), docs `vite` `8.x` (pinned to vite 7 for vitepress/Nuxt peer compatibility), `@nuxt/devtools` `4.0.0-alpha.*` (pre-release), and `h3` `2.0.0-rc.*` (pre-release). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `tsx` to `^4.23.12`.

---

## 2026-08-10

### Changed

#### Dependencies

- **Production dependencies**: Bumped `@orpc/*` to `1.15.0` and `pg` to `^8.23.0`. Skipped `@maizzle/framework` 6.x (incompatible with PostHTML email templates), `mail-preview` `tailwindcss` 3.x (intentional for email preview), `oxfmt` 0.57+ (CSS parse regression), docs `vite` `8.x` (pinned to vite 7 for vitepress/Nuxt peer compatibility), `@nuxt/devtools` `4.0.0-alpha.*` (pre-release), and `h3` `2.0.0-rc.*` (pre-release). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

---

## 2026-08-09

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.58`, `@ai-sdk/anthropic` to `^4.0.36`, `@ai-sdk/openai` to `^4.0.36`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1106.0`, `@iconify-json/lucide` to `^1.2.122`, `@nuxtjs/robots` to `^6.1.4`, `@scalar/hono-api-reference` to `^0.11.13`, `dodopayments` to `^2.45.1`, `hono` to `^4.13.1`, `nodemailer` to `^9.0.5`, and upgraded `openapi-merge` to `^2.0.2` (major; `paths` is optional in OpenAPI 3.1 output, so the merge helper now guards before iterating). Skipped `@maizzle/framework` 6.x (incompatible with PostHTML email templates), `mail-preview` `tailwindcss` 3.x (intentional for email preview), `oxfmt` 0.57+ (CSS parse regression), docs `vite` `8.x` (pinned to vite 7 for vitepress/Nuxt peer compatibility), `@nuxt/devtools` `4.0.0-alpha.*` (pre-release), and `h3` `2.0.0-rc.*` (pre-release). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `@types/node` to `26.2.0`, `tsx` to `^4.23.11`, and `turbo` to `^2.10.9`.

---

## 2026-08-08

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.56`, `@ai-sdk/anthropic` to `^4.0.34`, `@ai-sdk/openai` to `^4.0.34`, `@orpc/*` to `1.14.15`, and `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1105.0`. Skipped `@maizzle/framework` 6.x (incompatible with PostHTML email templates), `mail-preview` `tailwindcss` 3.x (intentional for email preview), `oxfmt` 0.57+ (CSS parse regression), docs `vite` `8.x` (pinned to vite 7 for vitepress/Nuxt peer compatibility), `@nuxt/devtools` `4.0.0-alpha.*` (pre-release), and `h3` `2.0.0-rc.*` (pre-release). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `tsx` to `^4.23.9` and migrated to TypeScript 7 via `typescript-native-bridge@6.0.3-bridge.12.tsgo.7.0.2` (tsgo 7.0.2 engine with the classic TypeScript API required by `vue-tsc` and `nuxi typecheck`). Updated `@repo/logs` to import `createConsola` from `consola/core` for stricter TypeScript 7 module resolution.

---

## 2026-08-07

### Fixed

#### Organizations

- **Invitation accept button**: The organization invitation page Accept action now uses the primary button variant so it is visually distinct from Decline.
- **Invitation revoke caches**: Revoking an invitation invalidates both the full-organization and active-organization query caches.
- **Admin organization rename**: Saving an admin organization edit also invalidates the user organization switcher list.

#### Settings

- **Active sessions after password change**: Changing a password with `revokeOtherSessions` invalidates the active sessions list.

#### Permissions

- **Admin access gate**: Evaluate `admin.access` with `checkPermission({ user })` after the session is loaded, so the admin page does not depend on Permix `setup()` / `isReady` timing.

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.54`, `@ai-sdk/anthropic` to `^4.0.32`, `@ai-sdk/openai` to `^4.0.31`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1104.0`, `dodopayments` to `^2.45.0`, and `nuxt` to `4.5.2`. Skipped `@maizzle/framework` 6.x (incompatible with PostHTML email templates), `mail-preview` `tailwindcss` 3.x (intentional for email preview), `oxfmt` 0.57+ (CSS parse regression), `typescript` `7.x` (ecosystem not ready), docs `vite` `8.x` (pinned to vite 7 for vitepress/Nuxt peer compatibility), `@nuxt/devtools` `4.0.0-alpha.*` (pre-release), and `h3` `2.0.0-rc.*` (pre-release). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `tsx` to `^4.23.8` and docs `vue` to `3.5.41`.

---

## 2026-08-06

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.52`, `@ai-sdk/anthropic` to `^4.0.30`, `@ai-sdk/openai` to `^4.0.30`, `@better-auth/core`, `@better-auth/passkey`, and `better-auth` to `1.6.26`, `@nuxtjs/seo` to `5.3.10`, `marked` to `^18.0.9`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1103.0`, `nodemailer` to `^9.0.4`, `better-sqlite3` to `^13.0.3`, and `use-intl` to `^4.13.5`. Skipped `@maizzle/framework` 6.x (incompatible with PostHTML email templates), `mail-preview` `tailwindcss` 3.x (intentional for email preview), `oxfmt` 0.57+ (CSS parse regression), `typescript` `7.x` (ecosystem not ready), docs `vite` `8.x` (pinned to vite 7 for vitepress/Nuxt peer compatibility), `@nuxt/devtools` `4.0.0-alpha.*` (pre-release), and `h3` `2.0.0-rc.*` (pre-release). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `@nuxt/devtools` to `^3.4.1` and `tsx` to `^4.23.6`.

---

## 2026-08-05

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.50`, `@ai-sdk/anthropic` to `^4.0.28`, `@ai-sdk/openai` to `^4.0.28`, `@nuxtjs/seo` to `5.3.8`, `@orpc/*` to `1.14.14`, `marked` to `^18.0.8`, `nanoid` to `^6.0.1`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1102.0`, `hono` to `^4.13.0`, `openai` to `^7.4.0`, and `dompurify` to `^3.4.13`. Removed deprecated `@types/uuid` stub (the `uuid` package ships its own TypeScript definitions). Skipped `@maizzle/framework` 6.x (incompatible with PostHTML email templates), `mail-preview` `tailwindcss` 3.x (intentional for email preview), `oxfmt` 0.57+ (CSS parse regression), `typescript` `7.x` (ecosystem not ready), docs `vite` `8.x` (pinned to vite 7 for vitepress/Nuxt peer compatibility), `@nuxt/devtools` `4.0.0-alpha.*` (pre-release), and `h3` `2.0.0-rc.*` (pre-release). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `oxlint` to `1.77.0`.

---

## 2026-08-04

### Added

#### Admin

- **User bans**: Added admin controls to ban users with an internal reason and optional expiration, review active ban details, and unban users.

#### Developer tooling

- **Agent skills**: Added repository-scoped agent skills for common feature, auth, payments, database, docs, testing, and verification workflows.

#### Permissions

- **Permix authorization**: Introduced `@repo/permissions` with a typed permission matrix and `createPermissionRules` / `checkPermission` helpers. Wired Permix into oRPC (`permix/orpc`) for `adminProcedure` and organization/payment gates, and into the SaaS app via a per-app `permix/vue` plugin (no module-scope singleton), `PermixProvider`, and `usePermissions` / `useSetupPermissions`. UI guards now check permissions instead of scattered role string comparisons. Better Auth `organization.*` client endpoints stay on Better Auth's own access control.

### Changed

#### Dependencies

- **Production dependencies**: Added `permix` `^4.1.2`. Bumped `hono` to `^4.12.34`. Skipped `@types/uuid` (deprecated), `@maizzle/framework` 6.x (incompatible with PostHTML email templates), `mail-preview` `tailwindcss` 3.x (intentional for email preview), `oxfmt` 0.57+ (CSS parse regression), `typescript` `7.x` (ecosystem not ready), docs `vite` `8.x` (pinned to vite 7 for vitepress/Nuxt peer compatibility), `@nuxt/devtools` `4.0.0-alpha.*` (pre-release), and `h3` `2.0.0-rc.*` (pre-release). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `tsx` to `^4.23.5`.

---

## 2026-08-03

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.48`. Synced the lockfile to the catalog (including prior bumps for `ai` `^7.0.47`, `@ai-sdk/anthropic` and `@ai-sdk/openai` `^4.0.27`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` `3.1101.0`, `dodopayments` `^2.44.0`, `hono` `^4.12.33`, and `openai` `^7.3.0`). Skipped `@types/uuid` (deprecated), `@maizzle/framework` 6.x (incompatible with PostHTML email templates), `mail-preview` `tailwindcss` 3.x (intentional for email preview), `oxfmt` 0.57+ (CSS parse regression), `typescript` `7.x` (ecosystem not ready), docs `vite` `8.x` (pinned to vite 7 for vitepress/Nuxt peer compatibility), and `h3` `2.0.0-rc.*` (pre-release). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `start-server-and-test` to `^3.0.12`. Synced the lockfile (including prior bumps for `@iconify-json/lucide` `^1.2.121`, `@internationalized/date` `^3.12.3`, `prisma-zod-generator` `3.1.0`, `turbo` `^2.10.8`, and `vue-tsc` `^3.3.9`).

---

## 2026-08-02

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.47`, `@ai-sdk/anthropic` to `^4.0.27`, `@ai-sdk/openai` to `^4.0.27`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1101.0`, `dodopayments` to `^2.44.0`, `hono` to `^4.12.33`, and `openai` to `^7.3.0`. Skipped `@types/uuid` (deprecated), `@maizzle/framework` 6.x (incompatible with PostHTML email templates), `mail-preview` `tailwindcss` 3.x (intentional for email preview), `oxfmt` 0.57+ (CSS parse regression), `typescript` `7.x` (ecosystem not ready), docs `vite` `8.x` (pinned to vite 7 for vitepress/Nuxt peer compatibility), and `h3` `2.0.0-rc.*` (pre-release). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `@iconify-json/lucide` to `^1.2.121`, `@internationalized/date` to `^3.12.3`, `prisma-zod-generator` to `3.1.0`, `turbo` to `^2.10.8`, and `vue-tsc` to `^3.3.9`.

---

## 2026-07-31

### Fixed

- **Auth redirects**: Restricted login, signup, OTP, verify, and onboarding redirects to normalized root-relative SaaS paths, preventing untrusted `redirectTo` values from navigating users to external sites.
- **SaaS indexing**: Added app-wide `noindex, nofollow` robots metadata so authentication and protected SaaS pages are not included in search results.

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.42`, `@ai-sdk/anthropic` to `^4.0.24`, `@ai-sdk/openai` to `^4.0.24`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1098.0`, `@nuxt/devtools` to `^3.4.0`, and `stripe` to `^22.4.0`. Skipped `@types/uuid` (deprecated), `@nuxt/devtools` `4.0.0-alpha.*` (pre-release), `@maizzle/framework` 6.x (incompatible with PostHTML email templates), `mail-preview` `tailwindcss` 3.x (intentional for email preview), `oxfmt` 0.57+ (CSS parse regression), `typescript` `7.x` (ecosystem not ready), docs `vite` `8.x` (pinned to vite 7 for vitepress/Nuxt peer compatibility), and `h3` `2.0.0-rc.*` (pre-release). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

---

## 2026-07-30

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.41`, `@ai-sdk/openai` to `^4.0.23`, `@orpc/client`, `@orpc/json-schema`, `@orpc/openapi`, `@orpc/server`, `@orpc/tanstack-query`, and `@orpc/zod` to `1.14.13`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1097.0`, `@nuxt/icon` to `^2.4.1`, `@nuxt/image` to `2.1.0`, `@vueuse/core` and `@vueuse/nuxt` to `^14.4.0`, `better-sqlite3` to `^13.0.2`, `openai` to `^7.1.0`, and `resend` to `^6.18.1`. Skipped `@types/uuid` (deprecated), `@nuxt/devtools` `4.0.0-alpha.*` (pre-release), `@maizzle/framework` 6.x (incompatible with PostHTML email templates), `mail-preview` `tailwindcss` 3.x (intentional for email preview), `oxfmt` 0.57+ (CSS parse regression), `typescript` `7.x` (ecosystem not ready), docs `vite` `8.x` (pinned to vite 7 for vitepress/Nuxt peer compatibility), and `h3` `2.0.0-rc.*` (pre-release). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `vue` to `3.5.40` in `apps/docs`.

---

## 2026-07-29

### Fixed

#### Marketing & SaaS apps

- **i18n SEO rendering**: Restored strict SEO rendering by relying on Nuxt i18n's locale metadata, removed the manual locale head calls from the app roots, preserved typed favicon metadata, and added the SaaS `h3` catalog dependency needed for matching H3 types.

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.40`, `@ai-sdk/anthropic` to `^4.0.23`, `@ai-sdk/openai` to `^4.0.22`, `@orpc/client`, `@orpc/json-schema`, `@orpc/openapi`, `@orpc/server`, `@orpc/tanstack-query`, and `@orpc/zod` to `1.14.12`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1096.0`, `@prisma/adapter-pg`, `@prisma/client`, and `prisma` to `7.9.1`, `nuxt` to `4.5.1`, and upgraded `openai` to `^7.0.0` (major; no direct SDK usage in the repo). Skipped `@types/uuid` (deprecated), `@nuxt/devtools` `4.0.0-alpha.*` (pre-release), `@maizzle/framework` 6.x (incompatible with PostHTML email templates), `mail-preview` `tailwindcss` 3.x (intentional for email preview), `oxfmt` 0.57+ (CSS parse regression), `typescript` `7.x` (ecosystem not ready), and docs `vite` `8.x` (pinned to vite 7 for vitepress/Nuxt peer compatibility). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `@types/node` to `26.1.2` and `oxlint` to `1.76.0`.

---

## 2026-07-28

### Changed

#### Dependencies

- **Production dependencies**: Bumped `@orpc/*` to `1.14.10`, `@iconify-json/lucide` to `^1.2.120`, and `dompurify` to `^3.4.12`. Upgraded `prisma-zod-generator` to `3.0.1` (major) and regenerated Prisma Zod schemas. Synced the lockfile to the catalog (including `ai` `^7.0.37`, `@ai-sdk/*` `4.x`, `better-auth` / `@better-auth/core` / `@better-auth/passkey` `1.6.25`, `nuxt` `4.5.0`, `cookie` `^2.0.1`, `nanoid` `^6.0.0`, `nodemailer` `^9.0.3`, `resend` `^6.18.0`, `better-sqlite3` `^13.0.1`, `hono` `^4.12.32`, and related Nuxt/AWS/prisma packages). Skipped `@types/uuid` (deprecated), `@nuxt/devtools` `4.0.0-alpha.*` (pre-release), `@maizzle/framework` 6.x (incompatible with PostHTML email templates), `mail-preview` `tailwindcss` 3.x (intentional for email preview), `oxfmt` 0.57+ (CSS parse regression), and `typescript` `7.x` (ecosystem not ready). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `turbo` to `^2.10.7`, `oxlint` to `1.75.0`, and `oxlint-tsgolint` to `^7.0.2001` (major).

---

## 2026-07-27

### Fixed

#### API

- **Organization billing authorization**: Require organization membership when listing purchases and an owner or administrator role when creating organization checkout sessions. Inaccessible customer portal purchases now return `NOT_FOUND` to prevent resource enumeration.
- **Payment redirects**: Restrict checkout and customer portal return URLs to the configured SaaS application origin.
- **AI message validation**: Validate incoming UI messages with the AI SDK before converting them or invoking the model.

### Changed

#### API

- **Response contracts**: Added explicit, co-located Zod output schemas to every oRPC procedure and removed redundant notification response remapping.

#### Dependencies

- **Production dependencies**: Bumped `@ai-sdk/anthropic` to `^4.0.21`. Synced the lockfile to the catalog (including prior bumps for `ai` `^7.0.37`, `@aws-sdk/client-s3` / `@aws-sdk/s3-request-presigner` `3.1095.0`, `better-auth` / `@better-auth/core` / `@better-auth/passkey` `1.6.25`, `nuxt` `4.5.0`, `cookie` `^2.0.1`, `nanoid` `^6.0.0`, `nodemailer` `^9.0.3`, `better-sqlite3` `^13.0.1`, `hono` `^4.12.32`, `openai` `^6.49.0`, and related Nuxt/orpc/prisma packages). Skipped `@types/uuid` (deprecated), `@nuxt/devtools` `4.0.0-alpha.*` (pre-release), `@maizzle/framework` 6.x (incompatible with PostHTML email templates), `mail-preview` `tailwindcss` 3.x (intentional for email preview), `oxfmt` 0.57+ (CSS parse regression), `typescript` 7.x (ecosystem not ready), and `turbo` `2.10.7` (published within the one-day `minimumReleaseAge` window). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `@playwright/test` to `^1.62.0`.

---

## 2026-07-26

### Changed

#### Dependencies

- **Production dependencies**: Bumped `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1095.0`, `hono` to `^4.12.32`, `@ai-sdk/anthropic` to `^4.0.20`, `dodopayments` to `^2.43.0`, and `es-toolkit` to `^1.50.0`. Synced the lockfile to the catalog (including prior bumps for `ai` `^7.0.37`, `better-auth` / `@better-auth/core` / `@better-auth/passkey` `1.6.25`, `nuxt` `4.5.0`, `openai` `^6.49.0`, and related Nuxt/orpc/prisma packages). Skipped `@types/uuid` (deprecated), `@nuxt/devtools` `4.0.0-alpha.9` (pre-release), `@maizzle/framework` 6.x (incompatible with PostHTML email templates), `mail-preview` `tailwindcss` 3.x (intentional for email preview), `oxfmt` 0.57+ (CSS parse regression), `typescript` 7.x (ecosystem not ready), `@ai-sdk/anthropic` `4.0.21`, and `turbo` `2.10.7` (published within the one-day `minimumReleaseAge` window). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

---

## 2026-07-25

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.37`, `@ai-sdk/anthropic` to `^4.0.19`, `@ai-sdk/openai` to `^4.0.20`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1094.0`, `better-auth` / `@better-auth/core` / `@better-auth/passkey` to `1.6.25`, `@nuxt/content` to `^3.15.2`, `openai` to `^6.49.0`, and `use-intl` to `^4.13.4`. Synced the lockfile to the catalog (including prior bumps for `nuxt` `4.5.0`, `cookie` `^2.0.1`, `nanoid` `^6.0.0`, `nodemailer` `^9.0.3`, `dodopayments` `^2.42.2`, `hono` `^4.12.31`, `better-sqlite3` `^13.0.1`, and related Nuxt/orpc/prisma packages). Skipped `@types/uuid` (deprecated), `@nuxt/devtools` `4.0.0-alpha.8` (pre-release), `@maizzle/framework` 6.x (incompatible with PostHTML email templates), `mail-preview` `tailwindcss` 3.x (intentional for email preview), `oxfmt` 0.57+ (CSS parse regression), and `typescript` 7.x (ecosystem not ready). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `oxlint` to `1.75.0`, `oxlint-tsgolint` to `^7.0.2001`, `@types/node` to `26.1.1`, and `turbo` to `^2.10.6`.

---

## 2026-07-24

### Changed

#### Dependencies

- **Production dependencies**: Synced the lockfile to the catalog (including `ai` `^7.0.35`, `@ai-sdk/anthropic` `^4.0.18`, `@ai-sdk/openai` `^4.0.18`, `@aws-sdk/client-s3` / `@aws-sdk/s3-request-presigner` `3.1093.0`, `better-auth` / `@better-auth/core` / `@better-auth/passkey` `1.6.24`, `nuxt` `4.5.0`, `cookie` `^2.0.1`, `nanoid` `^6.0.0`, `nodemailer` `^9.0.3`, `dodopayments` `^2.42.2`, `hono` `^4.12.31`, and related Nuxt/orpc/prisma bumps). Bumped `@nuxtjs/seo` to `5.3.6`. Skipped `@types/uuid` (deprecated), `@nuxt/devtools` `4.0.0-alpha.8` (pre-release), `@maizzle/framework` 6.x (incompatible with PostHTML email templates), `mail-preview` `tailwindcss` 3.x (intentional for email preview), `oxfmt` 0.57+ (CSS parse regression), and `typescript` 7.x (ecosystem not ready). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `turbo` to `^2.10.6`.

---

## 2026-07-23

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.34`, `@ai-sdk/anthropic` to `^4.0.18`, `@ai-sdk/openai` to `^4.0.17`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1092.0`, `@nuxt/content` to `^3.15.1`, `@nuxtjs/i18n` to `10.5.0`, `@tanstack/vue-query` to `^5.101.4`, `use-intl` to `^4.13.3`, `resend` to `^6.18.0`, and `better-sqlite3` to `^13.0.1` (major upgrade). Skipped `@types/uuid` (deprecated), `@nuxt/devtools` `4.0.0-alpha.7` (pre-release), `@maizzle/framework` 6.x (incompatible with PostHTML email templates), `mail-preview` `tailwindcss` 3.x (intentional for email preview), `oxfmt` 0.57+ (CSS parse regression), and `typescript` 7.x (ecosystem not ready). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `oxlint` to `1.75.0` and `oxlint-tsgolint` to `^7.0.2001` (major upgrade).

---

## 2026-07-22

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.32`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1091.0`, `@prisma/adapter-pg`, `@prisma/client`, and `prisma` to `7.9.0`, `marked` to `^18.0.7`, `@tanstack/vue-query` to `^5.101.3`, and `@polar-sh/sdk` to `^0.49.0`. Skipped `@types/uuid` (deprecated), `@nuxt/devtools` `4.0.0-alpha.7` (pre-release), `@maizzle/framework` 6.x (incompatible with PostHTML email templates), `mail-preview` `tailwindcss` 3.x (intentional for email preview), `oxfmt` 0.57+ (CSS parse regression), and `typescript` 7.x (ecosystem not ready). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

---

## 2026-07-21

### Changed

#### Dependencies

- **Production dependencies**: Synced the lockfile for catalog upgrades from previous runs (including major upgrades for `ai` 7.x, `@ai-sdk/*` 4.x, `cookie` 2.x, `nodemailer` 9.x, `nanoid` 6.x, and `resend` 6.x, plus `@nuxt/content` 3.15.0, `@nuxt/icon` 2.3.1, `@nuxt/ui` 4.10.0, `@nuxtjs/i18n` 10.4.1, `@nuxtjs/robots` 6.1.3, `@nuxtjs/seo` 5.3.3, `@orpc/*` 1.14.8, `dodopayments` 2.42.2, `hono` 4.12.31, `nuxt` 4.5.0, `openai` 6.48.0, `stripe` 22.3.2, and `tailwindcss` 4.3.3). Skipped `@maizzle/framework` `6.x` (incompatible with PostHTML email templates), `@nuxt/devtools` `4.0.0-alpha.7` (pre-release), `oxfmt` `0.58.0+` (CSS formatting regression), `typescript` `7.x` (major upgrade pending ecosystem support), and `@types/uuid` (deprecated). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `@types/node` to `26.1.1`, `oxlint` to `1.74.0`, `oxlint-tsgolint` to `^0.25.0`, `turbo` to `^2.10.5`, and `vue-tsc` to `^3.3.7`.

---

## 2026-07-20

### Fixed

- **i18n SEO**: Enabled `experimental.strictSeo` so locale head tags are injected by `@nuxtjs/i18n` directly, avoiding unhead v3 type incompatibilities with manual `useLocaleHead` merging in `app.vue`.

### Changed

#### Dependencies

- **Production dependencies**: Bumped `hono` to `^4.12.31`, `nuxt` to `4.5.0` (Vite 8, unhead v3), `@iconify-json/lucide` to `^1.2.118`, and `vitepress` to `2.0.0-alpha.18` (Vite 8 compatible). Removed the workspace `vite` override now that Nuxt 4.5 and VitePress ship Vite 8. Synced the lockfile for catalog upgrades from the previous run. Skipped `@maizzle/framework` `6.x` (incompatible with PostHTML email templates), `@nuxt/devtools` `4.0.0-alpha.7` (pre-release), `oxfmt` `0.58.0+` (CSS formatting regression), `typescript` `7.x` (major upgrade pending ecosystem support), and `@types/uuid` (deprecated). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

---

## 2026-07-19

### Fixed

- **Docs**: Removed the explicit VitePress `Theme` type annotation in the docs theme entrypoint to avoid a `vue-tsc` excessive stack depth error after upgrading `vue` to `3.5.40`.

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.31`, `@ai-sdk/anthropic` to `^4.0.16`, `@ai-sdk/openai` to `^4.0.16`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1090.0`, and `vue` to `^3.5.40` in the docs app. Synced the lockfile for catalog upgrades from previous runs (including major upgrades for `ai` 7.x, `@ai-sdk/*` 4.x, `cookie` 2.x, `nodemailer` 9.x, `nanoid` 6.x, and `resend` 6.x, plus `@nuxt/ui` 4.10.0, `@orpc/*` 1.14.8, `hono` 4.12.30, `stripe` 22.3.2, and `tailwindcss` 4.3.3). Skipped `@maizzle/framework` `6.x` (incompatible with PostHTML email templates), `@nuxt/devtools` `4.0.0-alpha.7` (pre-release), `oxfmt` `0.58.0+` (CSS formatting regression), `typescript` `7.x` (major upgrade pending ecosystem support), and `@types/uuid` (deprecated). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `@types/node` to `26.1.1`, `oxlint` to `1.74.0`, `oxlint-tsgolint` to `^0.25.0`, and `turbo` to `^2.10.5`.

---

## 2026-07-18

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.30`, `@ai-sdk/openai` to `^4.0.15`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1089.0`, `@nuxt/ui` to `^4.10.0`, `openai` to `^6.48.0`, `@scalar/hono-api-reference` to `^0.11.11`, and `stripe` to `^22.3.2`. Synced the lockfile for catalog upgrades from previous runs (including major upgrades for `ai` 7.x, `@ai-sdk/*` 4.x, `cookie` 2.x, `nodemailer` 9.x, `nanoid` 6.x, and `resend` 6.x). Skipped `@maizzle/framework` `6.x` (incompatible with PostHTML email templates), `@nuxt/devtools` `4.0.0-alpha.7` (pre-release), `oxfmt` `0.58.0+` (CSS formatting regression), `typescript` `7.x` (major upgrade pending ecosystem support), and `@types/uuid` (deprecated). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `@tailwindcss/vite` to `^4.3.3`, `tailwindcss` to `4.3.3`, `oxlint` to `1.74.0`, and `oxlint-tsgolint` to `^0.25.0`.

---

## 2026-07-16

### Fixed

- **Avatar crop dialog**: Contained the Cropper.js canvas and shade inside the dialog so resizing the crop area no longer overflows the modal. The initial crop selection is 95% of the available area so drag handles stay visible by default.

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.28`, `@ai-sdk/anthropic` to `^4.0.15`, `@ai-sdk/openai` to `^4.0.14`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1087.0`, and `openai` to `^6.47.0`. Synced the lockfile for catalog upgrades from previous runs (including major upgrades for `ai` 7.x, `@ai-sdk/*` 4.x, `cookie` 2.x, `nodemailer` 9.x, `nanoid` 6.x, and `resend` 6.x). Skipped `@maizzle/framework` `6.x` (incompatible with PostHTML email templates), `@nuxt/devtools` `4.0.0-alpha.7` (pre-release), `oxfmt` `0.58.0+` (CSS formatting regression), `typescript` `7.x` (major upgrade pending ecosystem support), and `@types/uuid` (deprecated). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `turbo` to `^2.10.5` and `oxlint-tsgolint` to `^0.24.0`.

#### Apps

- **Favicon**: Aligned SaaS, marketing, and docs to use the shared rocket `icon.png` favicon (marketing previously used a Nuxt SVG mark; docs had no favicon).

#### Theme and UI

- **Color tokens**: Switched Nuxt UI palettes from taupe to zinc neutrals with slate primary accents (light `slate-500`, dark `slate-400`), matching the Next.js theme. Updated mail theme hex values accordingly.
- **Font**: Switched the shared app font from Figtree to Plus Jakarta Sans (`tooling/tailwind/theme.css`), including docs VitePress and mail layout references. Nuxt UI handles font loading in the SaaS and marketing apps.
- **Logo**: Slightly smaller default logo mark (`size-8`).
- **Buttons**: Outline buttons use highlighted/foreground-based borders and hover fills (`apps/saas/app.config.ts`).
- **Radius**: Raised shared `--ui-radius` to `0.75rem` to align with the Next.js theme radius.

#### SaaS app

- **App shell**: Removed the floating content card in `apps/saas/layouts/app.vue`. Navbar and main content share the same background and are separated by a border; content padding aligns with the navbar.
- **Navbar collapse**: Replaced the header PanelLeft toggle with a Vercel-style edge drag strip (hover chip) to expand/collapse the sidebar. Active nav items use a muted background instead of a bordered elevated card. Expanded mode shows the logo label.
- **Organization select**: Card-styled trigger with tighter padding and smaller logos; dropdown opens to the right when the sidebar is collapsed and uses the trigger as min-width. Plan label line-height is tightened so the trigger height stays stable. Personal account uses a user icon (instead of the profile photo), drops the group title, and shows the “Personal account” label as the row text.
- **User menu**: Dropdown opens above (expanded), to the right (collapsed desktop), or below and end-aligned (mobile).
- **Auth screens**: Removed the bordered auth card wrapper; titles and subtitles are centered. Login divider labels use the page background; primary submit buttons on signup/forgot/reset.
- **Settings**: Simplified active sessions and connected accounts rows; settings item headers get consistent bottom padding on wide layouts.

#### Marketing

- **Hero**: Dropped the primary-tinted gradient background; hero media frame uses `bg-muted`.

#### Database

- **Two-factor authentication**: Added `failedVerificationCount` and `lockedUntil` to the `TwoFactor` model in Prisma and the PostgreSQL, MySQL, and SQLite Drizzle schemas. Apply with your usual database push/migrate workflow.

---

## 2026-07-15

### Changed

#### Mail

- **Default provider**: Switched the default mail provider export from Plunk to Resend. The Plunk provider implementation and `PLUNK_API_KEY` example environment variable were removed.

#### Dependencies

- **Production dependencies**: Bumped `@iconify-json/lucide` to `^1.2.117`. Skipped `ai` `7.0.26`, `@ai-sdk/*` `4.0.13`/`4.0.14`, and `@aws-sdk/*` `3.1086.0` because they were published within the last 24 hours, plus `@maizzle/framework` `6.x` (incompatible with PostHTML email templates), `@nuxt/devtools` `4.0.0-alpha.7` (pre-release), `oxfmt` `0.58.0` (CSS formatting regression), `typescript` `7.x` (major upgrade pending ecosystem support), and `@types/uuid` (deprecated). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Skipped `turbo` `2.10.5` because it was published within the last 24 hours.

---

## 2026-07-14

### Fixed

- **Builds**: Added `.nvmrc` (Node 22) so Vercel and CI use a Node version compatible with `nanoid` 6.x. Replaced `@maizzle/cli` invocations in `mail-preview` with direct `@maizzle/framework` scripts to avoid intermittent `Cannot find module '@maizzle/framework'` failures during `pnpm build`. Added a build job to the PR validation workflow.

### Changed

#### Dependencies

- **Production dependencies**: Bumped `@orpc/*` to `1.14.8`, `hono` to `^4.12.30`, and `nanoid` to `^6.0.0`. Synced the lockfile for catalog upgrades from previous runs (including `ai` 7.x, `@ai-sdk/*` 4.x, `cookie` 2.x, `nodemailer` 9.x, and `resend` 6.x). Skipped `@maizzle/framework` `6.x` (incompatible with PostHTML email templates), `@nuxt/devtools` `4.0.0-alpha.7` (pre-release), `oxfmt` `0.58.0` (CSS formatting regression), `typescript` `7.x` (major upgrade pending ecosystem support), and `@types/uuid` (deprecated). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `tsx` to `^4.23.1`.

---

## 2026-07-13

### Changed

#### Dependencies

- **Production dependencies**: Bumped `dompurify` to `^3.4.12`. Skipped `@maizzle/framework` `6.x` (incompatible with PostHTML email templates), `@nuxt/devtools` `4.0.0-alpha.7` (pre-release), `oxfmt` `0.58.0` (CSS formatting regression), `typescript` `7.x` (major upgrade pending ecosystem support), and `@types/uuid` (deprecated). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

---

## 2026-07-12

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.22`, `@ai-sdk/anthropic` to `^4.0.12`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1085.0`, `hono` to `^4.12.29`, `@nuxtjs/i18n` to `10.4.1`, and `use-intl` to `^4.13.2`. Synced the lockfile for catalog upgrades from the previous run. Skipped `@maizzle/framework` `6.x` (incompatible with PostHTML email templates), `@nuxt/devtools` `4.0.0-alpha.7` (pre-release), `oxfmt` `0.58.0` (CSS formatting regression), `typescript` `7.x` (major upgrade pending ecosystem support), and `@types/uuid` (deprecated). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `oxlint` to `1.73.0`, `oxlint-tsgolint` to `0.24.0`, `turbo` to `2.10.4`, and `@types/node` to `26.1.1`.

---

## 2026-07-11

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.19`, `@ai-sdk/anthropic` to `^4.0.11`, `@ai-sdk/openai` to `^4.0.11`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1084.0`, `dodopayments` to `^2.42.2`, `marked` to `^18.0.6`, `openai` to `^6.46.0`, and `stripe` to `^22.3.1`. Skipped `@maizzle/framework` `6.x` (incompatible with PostHTML email templates), `@nuxt/devtools` `4.0.0-alpha.7` (pre-release), `oxfmt` `0.58.0` (CSS formatting regression), `typescript` `7.x` (major upgrade pending ecosystem support), and `@types/uuid` (deprecated). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

---

## 2026-07-10

### Changed

#### Dependencies

- **Production dependencies**: Synced the lockfile with catalog major upgrades (`ai` `^7.0.16`, `@ai-sdk/*` `^4.0.x`, `cookie` `^2.0.1`, `cropperjs` `2.1.1`, `resend` `^6.17.2`, `nodemailer` `^9.0.3`, and related packages). Bumped `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1083.0` and `@scalar/hono-api-reference` to `^0.11.9`.
- **Development dependencies**: Bumped `@types/node` to `26.1.1`. Skipped `@ai-sdk/anthropic` `4.0.10`, `ai` `7.0.18`, `@ai-sdk/openai` `4.0.9`, and `@aws-sdk/*` `3.1084.0` because they were published within the last 24 hours; `@maizzle/framework` `6.x` (incompatible with PostHTML email templates), `@nuxt/devtools` `4.0.0-alpha.7` (pre-release), `oxfmt` `0.58.0` (CSS formatting regression), and `@types/uuid` (deprecated). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

---

## 2026-07-09

### Changed

#### Dependencies

- **Production dependencies**: Synced the lockfile with catalog major upgrades (`ai` `^7.0.16`, `@ai-sdk/*` `^4.0.x`, `cookie` `^2.0.1`, `cropperjs` `2.1.1`, `resend` `^6.17.1`, `nodemailer` `^9.0.3`, and related packages). Bumped `dodopayments` to `^2.42.1`, `vue-chartjs` to `^5.3.4`, and `vue-tsc` to `^3.3.7`.
- **Development dependencies**: Bumped `vitest` and `@vitest/coverage-v8` to `^4.1.10`, `turbo` to `^2.10.4`, and `oxlint` to `^1.73.0`. Skipped `@ai-sdk/anthropic` `4.0.9`, `ai` `7.0.17`, and `@aws-sdk/*` `3.1081.0` because they were published within the last 24 hours; `@maizzle/framework` `6.x` (incompatible with PostHTML email templates), `@nuxt/devtools` `4.0.0-alpha.7` (pre-release), `oxfmt` `0.58.0` (CSS formatting regression), and `@types/uuid` (deprecated). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

---

## 2026-07-08

### Changed

- **Dependabot**: Removed the `.github/dependabot.yml` configuration. Dependency updates are now manual or can be automated with AI agent tools such as Cursor Automations or Claude Code Routines. `pnpm-workspace.yaml` still enforces `minimumReleaseAge: 1440` (one day) at install time.

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.16`, `@orpc/*` to `1.14.7`, `hono` to `^4.12.28`, `dodopayments` to `^2.42.0`, and `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1080.0`.
- **Development dependencies**: Bumped `vitest` and `@vitest/coverage-v8` to `^4.1.10`, `turbo` to `^2.10.4`, and `oxlint` to `1.73.0`. Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

#### Fixed

- Pinned `vite` to `^7.3.1` via a pnpm override: nothing in the workspace depends on vite directly, so pnpm resolved peer dependencies (e.g. `@tailwindcss/vite`) against the newly released vite 8, which conflicts with the vite 7 bundled by vitepress and Nuxt and broke `docs` type-checking.
- Reverted `@maizzle/framework` to `^5.5.0`: Maizzle 6 is a Vue SFC/Vite rewrite that cannot render the PostHTML `.html` email templates in `packages/mail`, which broke transactional email rendering at runtime.
- Kept `oxfmt` at `0.56.0`: 0.57+ formats CSS files and fails to parse `tooling/tailwind/tailwind-animate.css` (custom properties like `--translate-1/2`).
- Replaced inline `@click="ref = value"` assignment handlers on `UButton` with named functions across `apps/saas` and `apps/marketing`; the stricter template type-checking in `vue-tsc` 3.3.6 rejects handlers returning a non-void value.
- Set `noEmit` in the root `tsconfig.json` so type-aware oxlint no longer fails with "Cannot write file ... would overwrite input file" for `packages/mail/email-theme.js`.

---

## 2026-07-07

### Changed

#### Dependencies

- **Production dependencies**: Bumped `@ai-sdk/openai` to `^4.0.8`. Other available updates (`ai` 7.0.16, `dodopayments` 2.42.0, `hono` 4.12.28, `@aws-sdk/client-s3` 3.1080.0, `oxlint` 1.73.0, `oxfmt` 0.58.0, and `turbo` 2.10.4) were skipped because they were published within the last 24 hours. Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

---

## 2026-07-06

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.15`, `@ai-sdk/anthropic` to `^4.0.8`, and `dodopayments` to `^2.41.0`. Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

---

## 2026-07-05

### Changed

#### Dependencies

- **Production dependencies**: Bumped `@iconify-json/lucide` to `^1.2.116`, `@maizzle/framework` to `^6.0.5` (reverted to `^5.5.0` on 2026-07-08), `@nuxtjs/seo` to `5.3.2`, and `resend` to `^6.17.1`.
- **Development dependencies**: Bumped `tsx` to `^4.23.0` and `turbo` to `^2.10.3`. Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

---

## 2026-07-04

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.14`, `@ai-sdk/anthropic` to `^4.0.7`, `@ai-sdk/openai` to `^4.0.7`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1079.0`, `@nuxt/content` to `^3.15.0`, `@nuxt/icon` to `^2.3.1`, and `@scalar/hono-api-reference` to `^0.11.8`. Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `tsx` to `^4.22.5`.

---

## 2026-07-03

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.11`, `@ai-sdk/anthropic` to `^4.0.5`, `@ai-sdk/openai` to `^4.0.5`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1078.0`, `@maizzle/framework` to `^6.0.4`, `@scalar/hono-api-reference` to `^0.11.7`, `nodemailer` to `^9.0.3`, and `use-intl` to `^4.13.1`. Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `@types/node` to `26.1.0`, `turbo` to `^2.10.2`, `vue-tsc` to `^3.3.6`, and `oxlint-tsgolint` to `^0.24.0`.

---

## 2026-07-01

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.7`, `@ai-sdk/anthropic` to `^4.0.2`, `@ai-sdk/openai` to `^4.0.3`, Better Auth to `1.6.23`, `@better-auth/core` to `1.6.23`, `@better-auth/passkey` to `1.6.23`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1076.0`, `@iconify-json/lucide` to `^1.2.115`, `@nuxt/icon` to `^2.2.5`, and `tailwindcss` to `4.3.2`. Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `oxlint` to `1.72.0`, `oxfmt` to `0.57.0`, and `turbo` to `^2.10.1`.

---

## 2026-06-30

### Changed

#### Dependencies

- **Production dependencies**: Major upgrades — `ai` to `^7.0.4`, `@ai-sdk/anthropic` to `^4.0.1`, `@ai-sdk/openai` to `^4.0.2`, `cookie` to `^2.0.0`, `nodemailer` to `^9.0.1`, `resend` to `^6.16.0`, and `@maizzle/framework` to `^6.0.2`. Migrated mail rendering to Maizzle v6 APIs and Tailwind CSS 4 `@theme` tokens in email templates. Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

---

## 2026-06-30 (earlier)

### Changed

#### Dependencies

- **Production dependencies**: Bumped `@ai-sdk/anthropic` to `^3.0.89`, `@ai-sdk/openai` to `^3.0.77`, and `ai` to `^6.0.214`. Major-version upgrades for `ai` 7.x, `@ai-sdk/*` 4.x, `cookie` 2.x, `nodemailer` 9.x, and `resend` 6.x were intentionally skipped pending migration work.
- **Development dependencies**: Bumped `@types/node` to `26.0.1`. Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

---

## 2026-06-29

### Changed

#### Dependencies

- **Production dependencies**: Bumped `@tanstack/vue-query` to `5.101.2` and `dodopayments` to `2.40.1`. Major-version upgrades for `ai` 7.x, `@ai-sdk/*` 4.x, `cookie` 2.x, `nodemailer` 9.x, and `resend` 6.x were intentionally skipped pending migration work. Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

---

## 2026-06-28

### Changed

#### Dependencies

- **Production dependencies**: Bumped Better Auth to `1.6.22`, `@better-auth/core` to `1.6.22`, `@better-auth/passkey` to `1.6.22`, `es-toolkit` to `1.49.0`, `@nuxtjs/robots` to `6.1.2`, and `@scalar/hono-api-reference` to `0.11.6`. Major-version upgrades for `ai` 7.x, `@ai-sdk/*` 4.x, `cookie` 2.x, `nodemailer` 9.x, and `resend` 6.x were intentionally skipped pending migration work. Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

---

## 2026-06-26

### Changed

#### Dependencies

- **Production dependencies**: Bumped 50+ production packages, including Nuxt `4.4.8`, `@nuxt/ui` `4.9.0`, Better Auth `1.6.20`, oRPC `1.14.6`, Prisma `7.8.0`, `@nuxtjs/i18n` `10.4.0`, Tailwind CSS `4.3.1`, AWS SDK S3 clients `3.1075.0`, and other workspace runtime dependencies. Major-version upgrades for `ai` 7.x, `@ai-sdk/*` 4.x, `cookie` 2.x, `nodemailer` 9.x, and `resend` 6.x were intentionally skipped pending migration work.
- **Development dependencies**: Bumped Turborepo to `2.10.0`, Oxlint to `1.71.0`, Oxfmt to `0.56.0`, TypeScript to `6.0.3`, Vitest to `4.1.9`, and Playwright to `1.61.1`. Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

#### SaaS app

- **i18n config**: Updated locale mapping in `nuxt.config.ts` for `@nuxtjs/i18n` 10.4.0 type compatibility.

---

## 2026-06-16

### Fixes and improvements

#### SaaS app

- **Organization members**: Removed the role permissions summary box from the members settings page. Role descriptions now appear only inside the role select dropdown (capped to one line), and the select trigger shows only the role label for a compact layout.

#### Infrastructure

- **Vercel builds**: Added a root `.npmrc` with `shamefully-hoist=true` and a public hoist pattern so pnpm resolves dependencies correctly when deploying to Vercel.

---

## 2026-06-08

### Fixes and improvements

#### SaaS app

- **Post-login & onboarding redirect with `requireOrganization`**: Fixed the root route failing to forward users who already belong to an organization to their organization dashboard after email login and after completing onboarding when `requireOrganization` is enabled. The redirect was performed in the authenticated index page's `setup` (a child of the `app` layout), which raced with the post-auth navigation and could leave the previous view (e.g. the login form) mounted while the URL already pointed at the organization route. Resolution of the organization requirement now happens once in the `app` layout (the navigation parent), matching how the organization-creation redirect already worked, and the index page only renders when no organization is required. Login and signup pages now also redirect already-authenticated visitors immediately instead of showing the form.
- **Invitation accept for new users**: Fixed a login-form flash when a not-yet-onboarded user accepted an organization invitation. Acceptance navigated straight to the organization route, which passed through the `app` layout whose session/onboarding gates briefly redirected to `/login` before forwarding to `/onboarding`. Not-yet-onboarded users are now sent directly to `/onboarding` (which uses the default layout) with the invited organization carried as the post-onboarding `redirectTo`, so they land on onboarding without the intermediate flash and continue to their organization once onboarding completes.

#### Infrastructure

- **Vite dev server**: Pre-bundles `@vue/devtools-core` and `@vue/devtools-kit` in the SaaS app's `optimizeDeps` so the dev server starts reliably when Vue DevTools dependencies are present.

## 2026-06-06

### Fixes and improvements

#### Marketing app

- **Favicon support**: Added a default favicon asset and registered it in the Nuxt app head so new projects include a browser tab icon by default.
- **Favicon path**: The marketing app now references `/favicon.svg` with the correct `image/svg+xml` MIME type instead of a non-existent `/icon.png` path.

#### SaaS app

- **Social auth visibility**: Login, signup, and account security connected-account provider UI now consistently respects `authConfig.enableSocialLogin`. When social login is disabled, provider sign-in buttons and provider linking controls are hidden.

- **Favicon support**: Added a default favicon asset and registered it in the Nuxt app head so new projects include a browser tab icon by default.

### Changed

#### Dependencies

- **Better Auth**: Bumped Better Auth from `1.6.3` to `1.6.11` and added `@better-auth/core` as a direct dependency in the auth package and SaaS app so Vercel builds resolve the split package when the SaaS app is the deployment root.
- **Hono**: Bumped Hono from `4.12.18` to `4.12.23` in the lockfile.

## 2026-06-05

### Fixes and improvements

#### Auth

- **Two-factor with social sign-in**: Fixed OAuth sign-in for accounts that have two-factor authentication enabled. Social sign-in pointed its OAuth `callbackURL` directly at the post-login destination, but Better Auth completes the OAuth callback without an active session when 2FA is required (it sets a temporary 2FA cookie instead). The protected destination then bounced the user back to the login page and the OTP form was never shown. Social sign-in now routes its callback through the `/verify` page (matching the magic-link flow), which renders the OTP form when verification is pending and forwards to the original destination once the session is established.

#### SaaS app

- **Organization invitation accept**: Fixed an "A composable that requires access to the Nuxt instance was called outside of a plugin, Nuxt hook, Nuxt middleware, or Vue setup function" error when accepting an organization invite. After the invitation page was refactored to resolve the invited organization across several `await` boundaries (including from the accept/decline click handlers), the post-accept `navigateTo` redirect lost the Nuxt instance context and threw. The redirects are now wrapped in `nuxtApp.runWithContext(...)` so navigation works regardless of how many async hops precede it.

## 2026-06-02

### Security

#### Auth

- **Open redirect via auth callbacks**: Better Auth was configured with `trustedOrigins: ["*"]`, which also disabled validation of callback/redirect URLs. A magic link with an attacker-controlled `callbackURL` could redirect a freshly authenticated user to any external origin (phishing/UI-redress), and expired-token requests honored the redirect too. The wildcard is replaced with an explicit allowlist derived from the app's own configured URLs, so off-origin callbacks are now rejected.
- **Username enumeration**: Removed the Better Auth `username()` plugin, which exposed an unauthenticated `/api/auth/is-username-available` endpoint that let anyone probe whether a username was taken (an enumeration vector aiding credential stuffing). Usernames are not used by default in this starter, so the plugin and its `username`/`displayUsername` User columns were dropped entirely.

#### Packages

- **Shared trusted origins helper**: Added `buildTrustedOrigins`/`getTrustedOrigins` to `@repo/utils` (with unit tests) as the single source of truth for the app's allowlisted origins. Both `@repo/auth` (Better Auth `trustedOrigins`) and `@repo/api` (Hono CORS `origin`) now derive their allowlist from this helper instead of hard-coding a wildcard or a single URL.

### Fixes and improvements

#### SaaS app

- **Post-login redirect with `requireOrganization`**: Default post-authentication navigation now flows through a single org-aware helper (`resolvePostLoginRedirect`) used by login, signup, email verification, two-factor, and social sign-in, so users without an organization land on a route that resolves the organization requirement instead of bouncing through follow-up redirects. The organization resolver now sends a user with a stale active organization and no accessible organizations to organization creation (previously it cleared the active organization and required another redirect), and the authenticated index redirects with `replace` and no longer throws a 404. Behavior is unchanged for users who already belong to an organization.
- **Organization settings**: Only organization owners now see the delete organization section and confirmation modal in general settings. Admins still retain access to the rest of organization settings.
- **Organization logo**: Added the missing English `organizations.settings.logo.delete` translation used by the logo removal control in organization settings.

---

## 2026-05-27

### Fixes and improvements

#### SaaS app

- **Organization members**: Fixed duplicate toasts on the settings members page when updating roles, removing members, or revoking invitations. Loading and success/error states now update a single toast instead of spawning a second one that briefly appeared empty.
- **Organization settings**: Members can no longer access organization settings pages directly; admins and owners retain access via the existing navigation and route guard.

### Changed

#### Infrastructure

- **pnpm v11**: Completed the pnpm 11 migration by moving Prisma hoist settings into `pnpm-workspace.yaml`, removing the legacy `.npmrc`, and dropping Husky and lint-staged in favor of CI and manual formatting checks. The workspace now requires Node.js `>=22` and pins `pnpm@11.3`.
- **Dependabot**: Removed the open-pull-requests limit and Dependabot cooldown so daily upgrade PRs are no longer capped. `pnpm-workspace.yaml` still enforces `minimumReleaseAge: 1440` (one day) at install time.

---

## 2026-05-25

### Fixes and improvements

#### Payments

- **Stripe one-time checkout**: Creating a checkout link for a user or organization that already has a Stripe customer no longer sends `customer_creation` alongside `customer`, which Stripe rejects with a parameter conflict error.

---

## 2026-05-21

### Fixes and improvements

#### Continuous integration

- **PR validation**: The validate-PRs workflow now matches the Next.js and TanStack starters with separate lint (including `pnpm format:check`), type-check, unit, and e2e jobs. End-to-end runs cover both SaaS and marketing apps, Vitest exercises `@repo/api` procedure tests, and CI sets `BETTER_AUTH_SECRET` (and existing database env fallbacks) so auth and database generation succeed in forks and PR builds.

#### Packages

- **Database (Drizzle)**: Drizzle schemas (`postgres`, `mysql`, `sqlite`) are aligned with the Prisma schema (indexes, uniques, nullability, and field parity), and timestamp columns use database defaults again. Organization member-count queries in the Drizzle layer no longer generate invalid SQL when updating subscription seats after accepting an invitation. `@repo/database` continues to export Prisma by default; Better Auth uses the Prisma adapter.

#### SaaS app

- **Organization invitation accept**: Accepting an invitation now redirects into the organization instead of reloading the invitation page. Session and organization caches are updated after accept, and already-accepted invites recover gracefully instead of showing a generic error.
- **Organization invitation validation**: Logged-in users see invitation errors as soon as the page loads when an invite is invalid, expired, or already used (via Better Auth `getInvitation`).
- **Organization members**: Removing a member now requires confirmation in a modal. Member and role changes update the query cache immediately so the list no longer flashes an empty state or forces a full page reload.
- **Organization members**: Fixed inverted role dropdown disabled state on the settings members page so organization admins can change roles for non-owner members; owner rows stay read-only, non-admins see a static role label, and the invite member form is limited to admins.
- **Organization members**: Role selects are ordered member → admin → owner (least to most access). The members settings page includes a role permissions summary, and each role option shows a short description of what it can do.
- **Login invitation alert**: Fixed spacing around the organization invitation alert on the login and signup forms.
- **Two-factor login flow**: Password and magic-link sign-ins now route users with enabled two-factor authentication through a dedicated OTP verification form. The OTP form uses Nuxt UI PinInput with browser one-time-code autofill attributes, auto-submits complete six-digit codes, and includes the missing 2FA setup error translations.

---

## 2026-05-20

### Fixes and improvements

#### SaaS app

- **SSR login crash**: Fixed a server-side crash when visiting the SaaS app unauthenticated. `useRouteQuery` from `@vueuse/router` can throw during Nuxt 4 SSR (`Invalid value used as weak map key`, `Cannot read properties of undefined (reading 'mode')`) when the login page renders on redirect. All former `useRouteQuery` call sites (auth forms and admin list filters) now use an SSR-safe `useRouteQueryParam` helper with batched URL write-back; the unused `@vueuse/router` dependency was removed from the SaaS app.
- **Organization invitation flow**: Invitation emails and auth redirects now use a consistent `invitationId` query param and `/organization-invitation` page instead of the legacy `invitationCode` / `/team/invitation` path. After sign-in or sign-up, users review the invite and explicitly accept or decline (invites are no longer auto-accepted). The page matches other auth screens (centered title and copy, organization logo and name preview, side-by-side actions with accept on the right) and shows a centered spinner while the session loads. Invitation links carry `organizationId`, `organizationName`, and `organizationLogo` through signup, login, and email verification. Post-accept setup failures are handled separately from invalid invites. Organization member revoke/remove actions and invitation revoke use stable row ids. Welcome notifications are in-app only and no longer trigger email delivery.

#### Auth

- **Invitation emails**: Organization invitation links include organization metadata (including logo when set) for the invitation landing page.

---

## 2026-05-19

### Fixes and improvements

#### Mail

- **Localized transactional email**: `sendEmail` now requires a `locale` and applies `mail.json` translations for subjects and body copy. Auth and notification call sites pass the user’s locale from the request cookie so magic links, password resets, invitations, and similar emails match the recipient’s language.
- **Production delivery on Vercel**: Mail translations are bundled into the server build so sending email no longer fails with missing `translations/*/mail.json` modules in serverless deployments.
- **Template cleanup**: Removed unused HTML templates (`teamInvitation`, `newUser`, `emailChange`) that were not referenced by `sendEmail`. Per-template HTML files remain for the active email types so layouts can still be customized individually.

#### Packages

- **Nuxt Icon dependency**: Added `@nuxt/icon` as a direct dependency (and catalog entry) for the marketing and SaaS apps so Nuxt UI can resolve icons reliably under pnpm after lockfile updates.

#### SaaS app

- **E2E CI**: Playwright’s web server health check targets `/login`, and the CI workflow generates the database client before e2e runs so the login page can start reliably in CI.

---

## 2026-05-14

### Fixes and improvements

#### Infrastructure

- **Dependency minimum release age**: A 1-day minimum release age is now enforced at two levels to reduce supply chain attack exposure. Dependabot is configured with `cooldown: default-days: 1` so upgrade PRs are not opened immediately for freshly published versions. `pnpm-workspace.yaml` sets `minimumReleaseAge: 1440` (minutes) so pnpm v11+ will also refuse to install any package version younger than one day, including transitive dependencies. Together these ensure a community-detection window before newly published - potentially compromised - versions reach the project.

---

## 2026-05-12

### Fixes and improvements

#### SaaS app

- **Active sessions**: Session rows now show a clear fallback when the client IP is unknown instead of surfacing a raw placeholder value.

#### Auth

- **Password rules**: Sign-up, password reset, and change-password flows share a dedicated password validation helper aligned with the Next.js kit so all on-screen criteria (length, character classes, etc.) match what the server enforces.

#### Packages

- **Auth database cleanup**: Account deletion and related cleanup paths use shared database helpers for removing auth-linked rows, reducing duplication across auth hooks and API handlers.

---

## 2026-05-10

### Fixes and improvements

#### Mail

- **Mail preview**: Aligned the mail preview app with the expected Tailwind version so preview styling matches the rest of the workspace.

---

## 2026-05-06

### Fixes and improvements

#### SaaS app

- **Notifications**: Added an in-app notification center, notification preferences, welcome notifications, and moved the desktop notification trigger into the navbar header for clearer access in expanded and collapsed sidebar layouts.
- **Avatar and organization logo removal**: Added secondary floating remove buttons for user avatars and organization logos, including storage cleanup when images are removed or when accounts and organizations are deleted.
- **SaaS navbar collapse behavior**: Collapsed desktop navbar submenus stay hidden, and clicking a collapsed item with submenu children now expands the sidebar so users can see the submenu items.
- **Account security settings**: Added separate set-password and change-password flows based on whether the user already has a credential account, prefetching accounts server-side to avoid layout shifts.
- **Two-factor authentication**: Added the required `verified` schema field for Better Auth two-factor setup, kept the 2FA block visible without a password, and show a clear password-required hint before enabling 2FA.
- **Passkeys**: Added passkey renaming, opened the rename dialog after successful passkey creation, saved a default passkey name on creation, and avoided success notifications when passkey registration is cancelled.

---

## 2026-05-05

### Changed

#### Payments

- **Active subscription gate**: `requireActiveSubscription` is disabled by default in `@repo/payments`, so new projects start with the implicit free-plan behavior unless they explicitly opt into the paywall.

### Fixes and improvements

#### Admin

- **Admin edit dialogs**: Added admin UI dialogs for editing users and organizations. User admins can update name, email, email verification state, and role; organization edits refresh the list after saving and use translated success/error notifications.
- **Organization updates**: Organization admin edits are limited to the organization name and the API validates that target organizations exist before updating them. Optional organization fields are no longer sent through the admin update path.

#### SaaS app

- **Navbar structure**: Updated the SaaS navbar with expandable submenus for account settings, organization settings, and admin routes, replaced the mobile horizontal navigation with a slide-in sidebar menu, and removed the old page-level tab navigation from settings and admin layouts.

---

## 2026-05-04

### Changed

#### Database

- **Prisma database entrypoint**: Restored the Prisma-based `@repo/database` entrypoint, Prisma generation scripts, Prisma query exports, and the Prisma auth adapter wiring after the Drizzle switch work. Repository settings keep Prisma formatting support for schema files.

### Fixes and improvements

#### SaaS app

- **Subscription gate**: The authenticated app layout now only fetches purchases and redirects to the plan chooser when `paymentsConfig.requireActiveSubscription` is enabled. Organization billing still resolves the relevant organization before checking purchases.
- **Billing page**: Account billing settings show a loading skeleton while purchases are loading instead of rendering the active-plan area prematurely.
- **Avatar and organization logo uploads**: Fixed the image cropper integration, avatar/logo rendering, and the image proxy route used for signed avatar images. The SaaS app now transpiles the cropper dependency and the S3 provider handles the image flow used by avatar and logo uploads.
- **Impersonation**: Stopping impersonation from the user menu now calls the admin stop-impersonation action, removes the progress toast, and reloads the page so the session state is refreshed.

#### Testing and CI

- **E2E tests**: Updated the SaaS Playwright configuration and package scripts so the end-to-end test setup runs correctly.
- **GitHub Actions**: Fixed the pull-request validation workflow after the database and type-check changes.

---

## 2026-04-30

### Added

#### Admin

- **Organizations list**: Added an admin organizations page with searchable, paginated organization rows and localized copy. The list includes organization info cells and action cells next to the existing admin user management surface.

### Changed

#### Database

- **Drizzle database work**: Added Drizzle schema, query, and Zod generation support in `@repo/database`, including organization, purchase, and user queries plus lockfile updates. The database generate script was made side-effect free during this work.
- **Auth adapter schema**: The auth package was updated to provide the Drizzle schema to the auth adapter while the Drizzle entrypoint work was in progress.

### Fixes and improvements

#### Billing

- **Plan loading**: Reduced duplicate billing plan and purchase fetches across active-plan components, organization selection, and account/organization billing settings.

#### SaaS app

- **Impersonation exit**: The impersonation menu item was made actionable and translated in all SaaS locales.
- **Nuxt footer copy**: Aligned footer copy and Nuxt-related project settings.

#### i18n and workspace typing

- **i18n package exports**: Added subpath exports for `@repo/i18n` and declared app workspace dependencies on the i18n package where needed.
- **Type-check gaps**: Resolved workspace type-check issues in the docs, marketing, SaaS, database, and mail packages, including Vue JSX runtime typing and query type fixes.
- **Formatting and editor config**: Applied repository formatting and aligned Tailwind/editor settings, including translation verification for SaaS locales.

---

## 2026-04-29

### Added

#### Tooling

- **Turbo caching**: Added Turbo caching configuration so build and validation tasks can reuse cached outputs consistently.

### Fixes and improvements

#### API

- **Admin oRPC query input**: Admin users and organizations list procedures now coerce GET query parameters for pagination, preventing OpenAPI/oRPC validation failures when `limit` and `offset` arrive as strings.
- **Purchase type parity**: Payments, auth, and organization code import `Purchase` from `@repo/database`, and the Prisma bundle re-exports it so consumers can use the same import shape across Prisma and Drizzle variants.

#### SaaS app

- **Admin user list state**: Admin user list search and pagination now sync with URL state more reliably.
- **Nuxt UI link/form patterns**: Updated Nuxt UI link and form usage across marketing and SaaS components, including removal of the unsupported `isExternal` slot prop from the SaaS navbar.
- **Organization creation**: Creating an organization now invalidates the organization list query before setting the new organization active, keeping layout resolution and prefetch state consistent.
- **Avatar and logo rendering**: Restored avatar and organization logo rendering so external `http(s)` image URLs remain untouched while stored avatar keys continue to resolve through the image proxy.

#### Mail

- **Mail package types**: Resolved the duplicate `SendEmailParams` export, renamed provider payload typing, declared the i18n dependency, and added a package type-check script.
- **Template path typing**: Tightened mail template path handling so Nuxt type checking passes with strict indexed access.
- **Resend dependency**: Added `resend` to the package dependencies and pnpm catalog, and removed an obsolete type suppression from the Resend provider.

#### CI

- **Pull-request validation**: Added type checking to the PR validation workflow, renamed the lint job to "lint & type check", and made type-checking run after database generation so generated Prisma artifacts exist before `tsc`.

#### Developer environment

- **Environment examples**: Updated `.env.local.example` with `DIRECT_URL`, current development ports, SaaS URL, mail, Resend, and S3 values. The old `.env.example` symlink was removed so `.env.local.example` remains the single tracked template.
- **Dependabot**: Configured Dependabot to ignore Tailwind CSS 3.x updates for the mail preview stack, while leaving Tailwind CSS 4.x catalog updates unchanged elsewhere.

---

## 2026-04-28

### Fixes and improvements

#### Mail preview

- **Email preview rendering**: Fixed mail preview configuration and dependencies so email templates render correctly in the preview app.

---

## 2026-04-27

### Changed

#### Mail

- **Email template theme**: Aligned the transactional email templates with the SaaS theme, including shared email theme settings, layout updates, button partials, and refreshed auth/invitation templates.

### Fixes and improvements

#### Mail

- **Vercel template loading**: Fixed mail template loading on Vercel by bundling templates in Nitro assets and updating the runtime template loader.
- **Email CSS rendering**: Disabled Tailwind preflight for email rendering so generated transactional email markup keeps predictable email-client styling.

#### Dependencies

- **`uuid`**: Bumped `uuid` from 13.0.0 to 14.0.0.
- **`hono`**: Bumped `hono` from 4.12.12 to 4.12.14.
