---
name: add-translations
description: "Use when adding locale keys, supported locales, typed Vue translations, localized content variants, or mail message interpolation."
---

# Add translations

## Scope

Use for SaaS, marketing, shared, or mail strings. Do not hard-code visible copy where a translation domain exists.

## Procedure

1. Choose `packages/i18n/translations/<locale>/{shared,saas,marketing,mail}.json`.
2. Add identical key structures to `en`, `de`, `es`, and `fr`; preserve interpolation/plural placeholders.
3. In Vue use each app's typed `modules/shared/composables/use-translations.ts`: `t(...)` in script and `$t(...)` in templates.
4. For mail preserve `subject` and context placeholders consumed by `packages/mail/util/localize-context.ts`.
5. To add a locale, update `packages/i18n/config.ts` and create all four JSON domains (`shared`, `saas`, `marketing`, and `mail`). Each app's `nuxt.config.ts` maps `Object.keys(i18nConfig.locales)` to its domain files (`shared.json` plus `saas.json` or `marketing.json`) and sets `langDir: "../../../packages/i18n/translations"`; the `NUXT_LOCALE` cookie name comes from `localeCookieName` in the shared config.
6. Respect routing: SaaS uses `no_prefix`; marketing uses `prefix_except_default`.
7. Run a missing-key parity check across `en`, `de`, `es`, and `fr` for the affected domain:

   ```bash
   node --input-type=module <<'NODE'
   import { readFile } from "node:fs/promises";

   const locales = ["en", "de", "es", "fr"];
   const scopes = ["shared", "saas", "marketing", "mail"];
   const flattenKeys = (value, prefix = "") =>
     Object.entries(value).flatMap(([key, child]) => {
       const path = prefix ? `${prefix}.${key}` : key;
       return child && typeof child === "object" ? flattenKeys(child, path) : [path];
     });
   const missingKeys = [];

   for (const scope of scopes) {
     const english = JSON.parse(
       await readFile(`packages/i18n/translations/en/${scope}.json`, "utf8"),
     );
     const expectedKeys = flattenKeys(english);
     for (const locale of locales.slice(1)) {
       const translated = JSON.parse(
         await readFile(`packages/i18n/translations/${locale}/${scope}.json`, "utf8"),
       );
       const translatedKeys = new Set(flattenKeys(translated));
       for (const key of expectedKeys) {
         if (!translatedKeys.has(key)) missingKeys.push(`${locale}/${scope}: ${key}`);
       }
     }
   }

   if (missingKeys.length) {
     console.error(missingKeys.join("\n"));
     process.exitCode = 1;
   }
   NODE
   ```

8. Run format, lint, type-check, and affected app build/E2E or mail-preview build.

Canonical reference: `apps/saas/modules/shared/composables/use-translations.ts` types `useI18n` from English JSON.

## Done

All locales have matching keys/placeholders, typed calls compile, and affected UI/mail renders.

## Common mistakes

- Updating only English because it drives types.
- Using untyped raw `useI18n`.
- Renaming a placeholder in one locale.
