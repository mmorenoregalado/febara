---
name: reviewing-a-pr
description: "Use when performing an evidence-based pull request review across Nuxt apps, workspace packages, tests, and Validate PRs gates."
---

# Review a PR

## Scope

Use for read-only review and risk assessment. Do not modify code, push, or approve based only on green CI.

## Procedure

1. Read intent/checks with `gh pr view <pr> --comments` and `gh pr checks <pr>`, then inspect `gh pr diff <pr>`.
2. Map files to Nuxt pages/modules, Hono/oRPC, auth, database, mail, notifications, or shared packages.
3. Compare with nearby canonical code. Check SSR safety, auto-imports, Nuxt UI forms, and typed translations.
4. Trace authorization and tenancy from UI through oRPC to database. Client organization IDs require membership checks such as `verifyOrganizationMembership`.
5. Check generated-file edits, provider signature validation, idempotent persistence, and secret handling.
6. Evaluate regression tests and compare commands with `.github/workflows/validate-prs.yml`; inspect failures via `gh run view <run-id> --log-failed`.
7. When a PR changes scripts, paths, aliases, app/package boundaries, infrastructure, or canonical implementation patterns, require matching updates to `AGENTS.md` and every affected `.agents/skills/*/SKILL.md`; stale agent instructions are a structural regression.
8. Report findings by severity with file/symbol, failure scenario, and fix. Separate blockers from optional improvements.

Canonical reference: `apps/saas/layouts/app.vue` centralizes auth, onboarding, and organization guards.

## Done

All changed paths are reviewed for correctness, security, tenancy, i18n, tests, and instruction drift; findings are reproducible and prioritized.

## Common mistakes

- Restating the diff without a failure mode.
- Reviewing UI without tracing its server procedure.
- Approving structural changes while canonical references or skills still point at old paths/commands.
