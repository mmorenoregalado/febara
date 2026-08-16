---
name: database-schema-change
description: "Use when changing persistent models, enums, indexes, relations, Prisma migrations, and matching Drizzle query schemas."
---

# Change the database schema

## Scope

Use for persistent data shape changes. Prisma owns the PostgreSQL schema and migrations; Drizzle supplies a parallel query implementation and portable schema alternatives.

## Procedure

1. Edit the model source `packages/database/prisma/schema.prisma`; `packages/database/prisma.config.ts` points Prisma at it and reads `DATABASE_URL`. Preserve mapped table names, Better Auth fields, relations, delete behavior, nullability, defaults, unique constraints, and indexes.
2. Mirror the active PostgreSQL query schema in `packages/database/drizzle/schema/postgres.ts`. Keep `mysql.ts` and `sqlite.ts` semantically equivalent—not textually identical—using each dialect's native enum, JSON, boolean, timestamp/update, ID, foreign-key, unique, and index constructs.
3. Keep both query layers aligned when a model or exported contract changes: `packages/database/prisma/queries/<domain>.ts` and `packages/database/drizzle/queries/<domain>.ts`, their `queries/index.ts` barrels, and source validation/types (`drizzle/zod.ts` when relevant). `packages/database/index.ts` currently exports Prisma; `drizzle/client.ts` currently targets PostgreSQL, but the Drizzle layer remains a swappable alternative.
4. Run `pnpm --filter @repo/database generate`. It regenerates `packages/database/prisma/generated/` and `packages/database/prisma/zod/index.ts`; fix the Prisma source/config instead of editing those outputs or their generator manifest.
5. Use `pnpm --filter @repo/database push` only for a disposable local database. Use `pnpm --filter @repo/database migrate` (`prisma migrate dev`) for a durable change; Prisma creates SQL under `packages/database/prisma/migrations/`. Review and commit the generated migration, but make subsequent model changes in `schema.prisma` and regenerate rather than treating migration SQL as the model source.
6. There is no Drizzle migration command in `packages/database/package.json`; do not run Drizzle Kit as the migration source. MySQL/SQLite files are maintained alternatives, not migrations applied by the current PostgreSQL setup.
7. For Better Auth-owned changes run `pnpm --filter @repo/auth migrate`. That command writes `packages/database/prisma/schema.prisma`; review its source diff, restore application-specific fields if necessary, mirror all Drizzle dialects/query layers, then regenerate.
8. Add API/query-boundary tests and run generation, format, lint, type-check, and relevant tests.

Canonical references: `NotificationType` and notification models exist in the Prisma schema and all three Drizzle dialect files; notification operations have matching files in both query directories.

## Done

Prisma/PostgreSQL and all Drizzle alternatives agree semantically; migration SQL is reviewed; both query contracts and exports match; generated boundaries and verification pass.

## Common mistakes

- Treating Drizzle Kit as migration source; current scripts are Prisma `generate`, `push`, and `migrate`.
- Copying PostgreSQL types literally into MySQL/SQLite instead of preserving semantics.
- Updating only the active Prisma query implementation or editing generated client/Zod output.
