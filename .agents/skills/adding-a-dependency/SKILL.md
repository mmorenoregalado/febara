---
name: adding-a-dependency
description: "Use when installing a runtime or development package into the correct pnpm workspace and catalog without corrupting lockfile ownership."
---

# Add a dependency

## Scope

Use only when existing packages cannot meet the requirement. Do not add convenience libraries for behavior already supplied by Nuxt, VueUse, Nuxt UI, Zod, or repository helpers.

## Procedure

1. Identify the importing workspace from its `package.json`; never put an app-only dependency at root.
2. Search `pnpm-workspace.yaml` and manifests for an existing catalog/workspace entry. Reuse `catalog:` or `workspace:*` when present.
3. Add a latest eligible shared package with `pnpm --filter <workspace-name> add <package> --save-catalog`; add dev tools with `-D`. For intentionally local versions use filtered `pnpm add` without `--save-catalog`.
4. Let pnpm update the manifest and `pnpm-lock.yaml`; never hand-edit resolutions. `minimumReleaseAge: 1440` may reject releases under 24 hours old—report it instead of bypassing it.
5. Import from the declaring workspace. Do not rely on `.npmrc` hoisting.
6. Run affected type-check/build, relevant tests, `pnpm format`, `pnpm lint`, and `pnpm type-check`.

Canonical reference: `apps/saas/package.json` uses `workspace:*` for `@repo/*` and `catalog:` for shared external packages.

## Done

Only the owning manifest, catalog if used, and lockfile change; install and verification pass.

## Common mistakes

- Running unfiltered `pnpm add` at root.
- Inventing a dependency version.
- Duplicating a shared version across manifests.
