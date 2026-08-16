---
name: add-a-marketing-page
description: "Use when creating a Nuxt marketing route, localized copy, metadata, and navigation coverage in apps/marketing."
---

# Add a marketing page

## Scope

Use for `apps/marketing` pages. There is no CMS/content layer in this app — copy lives in translation
files, not markdown. Do not put product documentation here; local product docs use VitePress under `apps/docs`.

## Procedure

1. Add pages at `apps/marketing/pages/<route>.vue`; compose `apps/marketing/modules/` sections and call `useSeoMeta` with translated title/description.
2. Add page strings to every marketing locale and use typed `useTranslations()`. Use `<NuxtLinkLocale>` for locale-aware internal links.
3. Update nearby navigation (`apps/marketing/modules/shared/components/NavBar.vue`/`Footer.vue`) when required and verify responsive, locale-prefixed routes.
4. Run `pnpm --filter marketing type-check`, `pnpm --filter marketing build`, `pnpm --filter marketing e2e:ci`, then root format/lint.

Canonical reference: `apps/marketing/pages/contact.vue` for a simple translated page composed from `modules/` sections.

## Done

Metadata exists, default/translated routes render, navigation is locale-aware, and build/E2E pass.

## Common mistakes

- Hard-coding marketing copy in pages instead of using translation keys.
- Using locale directories instead of the app's `prefix_except_default` i18n routing.
