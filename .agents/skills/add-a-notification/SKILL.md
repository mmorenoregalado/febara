---
name: add-a-notification
description: "Use when adding a typed in-app or email notification kind, preference catalog entry, persistence mapping, and localized UI labels."
---

# Add a notification

## Scope

Use for persisted notification kinds or emitters. Do not insert rows directly from features; use `createNotification`.

## Procedure

1. Add the value to Prisma `NotificationType`.
2. Run `pnpm --filter @repo/database generate`; never edit `packages/database/prisma/zod/index.ts`.
3. Update `NOTIFICATION_TYPES` in `packages/notifications/src/types.ts`, `NotificationTypeId`, and `NOTIFICATION_GROUPS` in `catalog.ts` when configurable.
4. Add labels/descriptions to all SaaS locales and an icon in `NotificationCenter.vue` when needed.
5. Create an emitter beside `packages/notifications/src/welcome.ts`, export it, and call `createNotification({ userId, type, data, link })` from server lifecycle code.
6. Decide email eligibility. `WELCOME` is explicitly in-app-only; other enabled types use preferences and the localized notification email.
7. Test preferences, disabled targets, links, and emitters; run generation, API tests, root gates, and schema migration/push as appropriate.

Canonical reference: `packages/notifications/src/welcome.ts` wraps `createNotification`; `create-notification.ts` applies preferences and email.

## Done

Schemas, constants, catalog, translations, icon, and emitter agree; preferences and tests pass.

## Common mistakes

- Omitting locale labels.
- Bypassing link normalization in `createNotification`.
