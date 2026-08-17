---
name: database-schema-change
description: "Use when changing persistent models, enums, indexes, relations, or Prisma migrations."
---

# Change the database schema

## Scope

Use for persistent data shape changes. Prisma owns the PostgreSQL schema, migrations, and query implementations.

## Procedure

1. Edit the model source `packages/database/prisma/schema.prisma`; `packages/database/prisma.config.ts` points Prisma at it and reads `DATABASE_URL`. Preserve mapped table names, Better Auth fields, relations, delete behavior, nullability, defaults, unique constraints, and indexes.
2. Update `packages/database/prisma/queries/<domain>.ts` and its `queries/index.ts` barrel when a model or exported contract changes.
3. Run `pnpm --filter @repo/database generate`. It regenerates `packages/database/prisma/generated/` and `packages/database/prisma/zod/index.ts`; fix the Prisma source/config instead of editing those outputs or their generator manifest.
4. Use `pnpm --filter @repo/database push` only for a disposable local database. Use `pnpm --filter @repo/database migrate` (`prisma migrate dev`) for a durable change; Prisma creates SQL under `packages/database/prisma/migrations/`. Review and commit the generated migration, but make subsequent model changes in `schema.prisma` and regenerate rather than treating migration SQL as the model source.
5. For Better Auth-owned changes run `pnpm --filter @repo/auth migrate`. That command writes `packages/database/prisma/schema.prisma`; review its source diff, restore application-specific fields if necessary, then regenerate.
6. Add API/query-boundary tests and run generation, format, lint, type-check, and relevant tests.

Canonical references: `NotificationType` and notification models exist in the Prisma schema; notification operations have matching files in `packages/database/prisma/queries/`.

## Done

Prisma/PostgreSQL schema, migration SQL, query contracts, and exports match; generated boundaries and verification pass.

## Common mistakes

- Editing generated client/Zod output instead of the Prisma source.
- Forgetting to regenerate after a schema change.
