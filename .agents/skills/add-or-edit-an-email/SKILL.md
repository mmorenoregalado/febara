---
name: add-or-edit-an-email
description: "Use when creating localized PostHTML/Maizzle 5 email templates, template registry entries, preview output, or server send call sites."
---

# Add or edit an email

## Scope

Use for transactional email. The catalog pins `@maizzle/framework` 5.x because these are PostHTML `.html` templates; Maizzle 6 Vue SFC syntax is incompatible.

## Procedure

1. Add/edit `packages/mail/emails/<Template>.html`; use PostHTML front matter, `{{ ... }}` locals, and `<component src="...">` to compose `layouts/base.html` and partials.
2. Register new IDs/files in `packages/mail/util/templates.ts` with a meaningful fallback subject.
3. Add identical translation objects/interpolation keys to every `packages/i18n/translations/{en,de,es,fr}/mail.json`. `buildLocalizedMailContent` localizes subject/template values and creates `bodyHtml`; `sendEmail` then merges caller context before rendering.
4. Send only on the server with `sendEmail({ to, locale, templateId, context })`; follow localized callbacks in `packages/auth/auth.ts`.
5. Preview via `pnpm --filter mail-preview dev` on `3005`; build with `pnpm --filter mail-preview build`. `apps/mail-preview/config.js` points Maizzle 5 content/components at `packages/mail/emails`.
6. Preserve `apps/saas/nuxt.config.ts` `nitro.serverAssets` entry (`baseName: "mail"`, `emails/**/*.html`). At runtime `packages/mail/index.ts` first resolves source files, then reads `assets:mail` through `util/nitro-assets.ts` and materializes the templates so Maizzle can resolve layouts/partials in serverless output.
7. Run preview build, format, lint, type-check, and feature tests.

Canonical references: `packages/mail/emails/EmailVerification.html` shows PostHTML composition and locals; `packages/mail/index.ts` renders with Maizzle 5 and handles Nitro assets.

## Done

All locales supply matching keys, Maizzle preview/build succeeds, call sites pass locale/context, and Nitro can resolve the template plus its components.

## Common mistakes

- Using Maizzle 6/Vue SFC syntax; workspace configuration pins 5.x.
- Editing only English messages.
- Adding a top-level template without registering it or including its layouts/partials in Nitro assets.
