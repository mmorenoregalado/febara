---
name: debugging-a-failing-ci-run
description: "Use when triaging a failed Validate PRs GitHub Actions job and reproducing its exact pnpm command and environment locally."
---

# Debug a failing CI run

## Scope

Use for `.github/workflows/validate-prs.yml` failures. Do not silence flaky symptoms; identify the first causal error.

## Procedure

1. Inspect checks with `gh pr checks <pr>` and logs with `gh run view <run-id> --log-failed`; record the job and first actionable trace.
2. Match the job: lint runs `pnpm lint` and `pnpm format:check`; type-check generates database code then runs `pnpm type-check`; build runs `pnpm build`; unit runs `pnpm --filter @repo/api test`; E2E runs both app `e2e:ci` scripts.
3. Reproduce with Node from `.nvmrc` (`22`) and pnpm from root `package.json` (`11.3.0`). Run `pnpm install` when dependency state matters.
4. Recreate workflow env with safe local values. CI supplies placeholders for `DATABASE_URL`, `BETTER_AUTH_SECRET`, `RESEND_API_KEY`, and `NUXT_OG_IMAGE_SECRET`; never commit or reuse them in production.
5. Reduce to the failed workspace/test and rerun the exact command. For E2E inspect `playwright-report/`, traces, and `test-results/` instead of adding sleeps.
6. Fix the correct layer, rerun the narrow reproduction, then the complete affected job commands and root gates.

Canonical reference: `.github/workflows/validate-prs.yml` defines all PR jobs and env fallbacks.

## Done

The failure is reproduced or explained by CI evidence, its root cause is documented, and the exact failed command passes.

## Common mistakes

- Debugging a cascade error rather than the first failure.
- Treating CI credentials as deployment config.
- Weakening assertions or type checks to get green.
