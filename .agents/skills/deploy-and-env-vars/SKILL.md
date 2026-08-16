---
name: deploy-and-env-vars
description: "Use when a developer explicitly requests deployment, preview promotion, or hosted environment-variable changes for the Nuxt monorepo."
triggers: ["user"]
---

# Deploy and manage environment variables

## Scope

Use only after explicit user request because deployment and hosted env changes mutate external state. Do not deploy during code verification or guess a provider/project.

## Procedure

1. Identify target app (`saas`, `marketing`, or `docs`), hosting project, environment, and mutation. Inspect existing settings first; this repo has no `vercel.json` or deploy script.
2. Classify `.env.local.example` values. Server-only values include `DATABASE_URL`, provider secrets, `MAIL_FROM`, `NUXT_OG_IMAGE_SECRET`, and `OPENAI_API_KEY`; browser values use `NUXT_PUBLIC_*`.
3. Keep URLs consistent: `NUXT_PUBLIC_SAAS_URL` is canonical for auth/API/SaaS; `NUXT_PUBLIC_SITE_URL` normally matches it; marketing/docs URLs point to their apps. Never use wildcard trusted origins.
4. Add only variables for enabled integrations. Storage needs S3 credentials/endpoint/region and a public bucket name.
5. Apply values through the already-linked hosting UI/CLI for the exact target/environment. Never print secrets, commit `.env.local`, or reuse CI placeholders in production.
6. Verify before mutation: `pnpm --filter @repo/database generate`, `pnpm --filter <app> build`, root `pnpm lint`, and `pnpm type-check`; docs uses `pnpm --filter docs build`.
7. Deploy only the requested target, then smoke-check it. SaaS exposes `/api/health`; verify auth callbacks. Report names changed, never values.

Canonical reference: `apps/saas/server/api/[...].ts` adapts Hono for Vercel; `packages/utils/lib/base-url.ts` supports `NUXT_PUBLIC_VERCEL_URL`.

## Done

Target/environment are unambiguous, builds pass, only requested variables change, deployment responds, and secrets stay out of logs/source.

## Common mistakes

- Assuming all apps share one deployment or URL.
- Exposing secrets with `NUXT_PUBLIC_`.
- Deploying when asked only for readiness/build verification.
