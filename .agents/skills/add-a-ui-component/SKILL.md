---
name: add-a-ui-component
description: "Use when creating a reusable Vue component with Nuxt UI primitives, auto-registration, accessible interaction, and typed props or slots."
---

# Add a UI component

## Scope

Use `packages/ui/components/` for cross-app primitives and app module components for feature UI. Do not promote one-off business components to shared UI.

## Procedure

1. Search Nuxt UI/existing components. Compose `UButton`, `UForm`, `UCard`, `UIcon`, and Reka-backed primitives instead of recreating behavior.
2. Add shared primitives as `packages/ui/components/<Name>.vue`; both apps auto-register `.vue` files from `@repo/ui/components` without prefixes.
3. Type props, emits/models, and slots. Guard browser APIs or use `.client.vue` where required.
4. Preserve semantic HTML, keyboard behavior, focus, labels, and ARIA names.
5. Use theme tokens such as `text-muted`, `bg-default`, and `text-primary`; follow `packages/ui/components/Logo.vue`.
6. Pass labels through props/slots and translate them in consuming apps.
7. Exercise a real consumer; run affected app type-check/build, root format/lint, and E2E.

Canonical reference: `apps/saas/modules/organizations/components/OrganizationNameForm.vue` composes accessible Nuxt UI form primitives with typed Zod submission.

## Done

Auto-registration, SSR, keyboard use, theme tokens, types, and affected verification pass.

## Common mistakes

- Assuming Radix `asChild`; this stack uses Nuxt UI/Reka UI.
- Source-relative imports for shared components.
- Putting app data-fetching/i18n inside `packages/ui`.
