---
name: writing-e2e-tests
description: "Use when adding or changing Playwright coverage for SaaS authentication flows, authenticated Nuxt pages, or marketing routes."
---

# Write E2E tests

## Scope

Use for browser behavior spanning routing, rendering, and interaction. Do not use Playwright for pure helpers or oRPC handler logic; use Vitest.

## Procedure

1. Choose `apps/saas/e2e/*.spec.ts` or `apps/marketing/e2e/*.spec.ts`; do not create a root test directory.
2. Read the app-local `playwright.config.ts`. Each sets `testDir: "./e2e"`, Chromium, HTML reporting, parallel local execution, CI retries/workers, and a managed `webServer`. SaaS uses `E2E_PORT` (default `3100`) and probes `/login`; marketing uses `3001`.
3. Follow `apps/saas/e2e/auth.spec.ts` or `apps/marketing/e2e/marketing.spec.ts`: import `{ expect, test }`, use relative URLs, and prefer roles, labels, or stable form IDs.
4. Assert outcomes and redirects. Avoid fixed sleeps; use web-first assertions and `waitForURL()`.
5. Keep tests independent and parallel-safe. Current SaaS coverage exercises public auth pages and unauthenticated redirects; there is no committed `globalSetup` or `storageState` fixture. For authenticated coverage, create an isolated test user/organization in a disposable PostgreSQL database through supported auth/setup code, sign in during an explicit setup project/fixture, and reuse state under ignored test output. Never use production accounts, persist cookies in source, or assume test order.
6. Use `pnpm --filter saas e2e` or `pnpm --filter marketing e2e` for Playwright UI mode. Use `pnpm --filter saas e2e:ci` or `pnpm --filter marketing e2e:ci` for headless execution; these scripts install Chromium, and SaaS also runs database generation. Do not manually start a second server because Playwright owns it.
7. E2E is required for changed pages, layouts, navigation, auth, forms, redirects, hydration, or browser interactions. It is skippable for pure server/helper changes only when no browser contract can change; cover those with Vitest and record the reason.
8. CI runs both `e2e:ci` commands. Its `playwright-report` artifact currently uploads only `apps/saas/playwright-report/` for 30 days; marketing still runs but its HTML report is not in that artifact. Use each app's local `playwright-report/`, `test-results/`, and traces while debugging.
9. Run `pnpm format`, `pnpm lint`, and `pnpm type-check` after the suite passes.

Canonical reference: `apps/saas/e2e/auth.spec.ts` demonstrates accessible selectors and redirect assertions.

## Done

The relevant headless command passes from Playwright's clean app start; authenticated data is isolated; tests do not depend on execution order; required/skipped coverage and report location are explicit.

## Common mistakes

- Assuming root `pnpm test` runs Playwright.
- Reusing local/production sessions instead of explicit test auth setup.
- Selecting generated CSS classes or using arbitrary timeouts.
