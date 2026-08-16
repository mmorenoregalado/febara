---
name: add-a-feature-module
description: "Use when adding a cohesive Nuxt 4 SaaS or marketing feature module with auto-imported Vue components, composables, and route integration."
---

# Add a feature module

## Scope

Use for a UI capability spanning components, composables, and pages. Do not create a package for app-only behavior or invent `@repo/*` path aliases.

## Procedure

1. Choose `apps/saas/modules/<feature>/` or `apps/marketing/modules/<feature>/`; add `components/`, `composables/`, `lib/`, and `utils/` only as needed.
2. Add routes under app `pages/`. Authenticated SaaS routes use `definePageMeta({ layout: "app" })`. Use the typed `requiresActiveOrganization: true` route meta only when the route must force an organization independently of global auth config; use `[organizationSlug]` when URL scope matters. `apps/saas/layouts/app.vue` consumes that meta.
3. Rely on Nuxt config: both apps auto-import module composables/lib/utils and auto-register `.vue` components under `modules/` without path prefixes.
4. Keep data loading SSR-safe. Use `useORPC()` plus TanStack Vue Query and reactive inputs.
5. Build forms with Nuxt UI `UForm`, Zod, and typed `FormSubmitEvent`; follow `apps/saas/modules/organizations/components/OrganizationNameForm.vue`.
6. Put every visible string in all four locale variants of the relevant domain JSON (`packages/i18n/translations/{en,de,es,fr}/saas.json` or `marketing.json`) and consume it through the app's typed `useTranslations()` wrapper.
7. Add API/unit tests and Playwright coverage for visible routes; run app type-check and root gates.

Canonical references: `apps/saas/modules/organizations/` owns components/composables; `apps/saas/pages/(authenticated)/[organizationSlug]/settings/members.vue` provides a route entry point.

## Done

The intended layout renders, auto-imports resolve, data is SSR-safe and authorized, translations exist, and tests pass.

## Common mistakes

- Adding `"use client"` or Next.js APIs.
- Importing auto-registered components through invented aliases.
- Calling server database code from Vue.
