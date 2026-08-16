---
name: local-environment-setup
description: "Use when bootstrapping this Nuxt 4 monorepo with PostgreSQL, optional MinIO storage, workspace generation, and local app ports."
---

# Set up the local environment

## Scope

Use for a new checkout or broken bootstrap. Do not configure OAuth, mail, storage, or AI unless the exercised feature needs it.

## Procedure

1. Use Node `22` from `.nvmrc` and pnpm `11.3.0`; run `pnpm install` at root.
2. Run `cp .env.local.example .env.local`. Set `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/supastarter` and add a local-only, sufficiently long `BETTER_AUTH_SECRET` manually because the example currently omits it; retain the example's SaaS `3000`, marketing `3001`, and docs `3002` `NUXT_PUBLIC_*` URLs. Also export that `DATABASE_URL` in the current shell before direct database package scripts: their explicit `.env` flag does not read `.env.local` by itself.
3. Start PostgreSQL with `docker compose up -d postgres` and wait for health.
4. Run `pnpm --filter @repo/database generate`. Use `pnpm --filter @repo/database push` for a disposable local schema or `migrate` only when intentionally creating a migration.
5. For storage run `docker compose up -d minio minio-setup`; S3 is `9000`, console `9001`, and setup creates public `avatars`.
6. Start workspaces with `pnpm dev`. Mail preview uses port `3005`.
7. Smoke-check target routes and keep provider secrets only in ignored `.env.local`.

Canonical references: root `package.json` pins pnpm and scripts; `.env.local.example` defines most app/integration variables but currently omits `BETTER_AUTH_SECRET`; `packages/database/package.json` explicitly points dotenv at root `.env`; `docker-compose.yml` defines PostgreSQL 16 and MinIO ports, health checks, and bucket setup.

## Done

Generation succeeds, required containers are healthy, and target apps load without required-env errors.

## Common mistakes

- Storing secrets in `.env.local.example`.
- Leaving `DATABASE_URL` as `YOUR_DATABASE_CONNECTION_STRING`.
- Omitting `BETTER_AUTH_SECRET`; Better Auth requires it at runtime even though `.env.local.example` does not list it.
- Expecting direct database scripts to discover `.env.local` without exporting `DATABASE_URL`.
- Starting optional integrations for unrelated work.
