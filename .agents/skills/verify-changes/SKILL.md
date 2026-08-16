---
name: verify-changes
description: "Use when validating a completed repository change against Nuxt workspace quality gates, affected tests, and generated-file boundaries."
---

# Verify changes

## Scope

Use after implementation or before handoff. Do not substitute this checklist for feature-specific tests or repair unrelated failures.

## Procedure

1. Inspect the intended delta with `git status --short`, `git diff --check`, `git diff --stat`, and the full diff.
2. Reproduce clean-checkout dependency setup at repository root with `pnpm install`; every CI job starts from a checkout and runs this command. Do not rely on stale `node_modules`. Then run the current generator: `pnpm --filter @repo/database generate`.
3. Map changes to workspaces and run narrow tests first. The exact CI unit command is `pnpm --filter @repo/api test`; root `pnpm test` additionally runs `@repo/utils`. App Playwright suites are separate.
4. Apply fixes with `pnpm format` and, when needed, `pnpm lint:fix`. Match the CI lint job with both read-only gates: `pnpm lint` and `pnpm format:check`. Reinspect the diff because formatting writes files and lint runs database generation.
5. Run `pnpm type-check`. Match the CI build job with `pnpm --filter @repo/database generate` followed by `pnpm build`; do not replace the root build with one app build for cross-workspace changes.
6. E2E is required for changed routes, layouts, navigation, auth, forms, hydration, or other user-visible browser behavior: run the affected `pnpm --filter saas e2e:ci` and/or `pnpm --filter marketing e2e:ci`. It may be skipped for isolated docs, server-only, or pure utility changes only when browser behavior cannot be affected; report that reason. CI still runs both suites.
7. Confirm no secrets, `console.log`, unjustified `any`, or generated output entered the diff. Never hand-edit `.nuxt/`, `.output/`, `packages/database/prisma/generated/`, or `packages/database/prisma/zod/index.ts`.
8. Compare the result with `.github/workflows/validate-prs.yml`: install is repeated per job; type-check, build, unit, and SaaS E2E explicitly generate Prisma; lint runs `pnpm lint` plus `pnpm format:check`; build runs `pnpm build`; unit runs only `@repo/api`; E2E runs both apps.

## Common failures

| Failure                                                    | Fix                                                                                                                                                                      |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Missing/stale Prisma client or Zod types                   | Set a syntactically valid `DATABASE_URL`, edit `prisma/schema.prisma`, then run `pnpm --filter @repo/database generate`; never patch generated files.                    |
| `catalog:` resolution or fresh install fails               | Check `pnpm-workspace.yaml` and the lockfile. `minimumReleaseAge: 1440` rejects releases younger than 24 hours; select an eligible version rather than bypassing policy. |
| `pnpm format:check` reports indentation/import/class order | Run `pnpm format`. Oxfmt owns tabs and `vueIndentScriptAndStyle`; do not hand-align against its output.                                                                  |

Canonical reference: `.github/workflows/validate-prs.yml` is the PR gate definition.

## Done

Report each command and result, including skipped suites and why. Relevant gates pass and the final diff contains only intended source changes.

## Common mistakes

- Treating root `pnpm test` as E2E coverage.
- Running only formatter/linter write commands without the CI check commands.
- Keeping unrelated formatter changes.
