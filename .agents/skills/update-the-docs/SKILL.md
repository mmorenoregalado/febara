---
name: update-the-docs
description: "Use when editing the repository's VitePress product documentation, navigation, examples, or operational instructions to match current code."
---

# Update the docs

## Scope

Use for local docs under `apps/docs`. Do not put marketing posts here. If the request targets supastarter.dev docs owned by another repository, state the out-of-repo handoff and do not invent a local path.

## Procedure

1. Verify behavior against source, scripts, `.env.local.example`, `docker-compose.yml`, and `.github/workflows/validate-prs.yml`; current code wins over stale prose.
2. Edit Markdown in `apps/docs/`; update `.vitepress/config.ts` only for navigation, metadata, theme, or build-time values.
3. Use exact commands: `pnpm --filter docs dev` (port `3002`), `pnpm --filter docs build`, and `pnpm --filter docs type-check`.
4. Keep examples Nuxt 4/Vue-specific: composables, pages/server routes, `NUXT_PUBLIC_*`, and pnpm filters—not Next.js patterns.
5. Link real paths/symbols and never present generated output as editable source.
6. Preview links, headings, code blocks, and navigation; run docs build/type-check.
7. Run root format/lint if config/theme code changes and inspect the diff for unrelated rewrites.

Canonical reference: `apps/docs/.vitepress/config.ts` configures local search, theme navigation/footer, and passes `NUXT_PUBLIC_MARKETING_URL` through Vite `define` as `__MARKETING_URL__`.

## Done

Instructions reproduce current behavior, links resolve, VitePress checks pass, and external docs receive an explicit repository handoff.

## Common mistakes

- Trusting stale prerequisites instead of `.nvmrc` and `package.json`.
- Editing VitePress output instead of source.
