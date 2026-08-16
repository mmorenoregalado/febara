---
name: writing-unit-tests
description: "Use when adding Vitest coverage for oRPC procedures, database-independent service logic, or shared TypeScript utilities."
---

# Write unit tests

## Scope

Use for deterministic TypeScript in `packages/api` or `packages/utils`. Do not add Vue component tests; no component-test harness exists.

## Procedure

1. Put `*.test.ts` beside source. Both test workspaces use Vitest with a Node environment.
2. For oRPC follow `packages/api/modules/ai/procedures/stream-message.test.ts`: hoist `vi.mock` declarations, import mocked bindings and the procedure afterward, set typed mock outcomes, and invoke the procedure through `call`.

```ts
import { call } from "@orpc/server";
import { vi } from "vitest";

vi.mock("@repo/database", () => ({ getOrganizationBySlug: vi.fn() }));

import { getOrganizationBySlug } from "@repo/database";
import { generateOrganizationSlug } from "./generate-organization-slug";

vi.mocked(getOrganizationBySlug).mockResolvedValueOnce(null);
const result = await call(
	generateOrganizationSlug,
	{ name: "Acme" },
	{ context: { headers: new Headers() } },
);
expect(result).toEqual({ slug: "acme" });
```

3. Cover authorization, invalid input, success output, and suppressed side effects. Use `vi.mocked`, `vi.clearAllMocks`, and typed fixtures such as `satisfies Session`.
4. For helpers follow `packages/utils/lib/trusted-origins.test.ts`; restore environment values in `afterEach`.
5. Run `pnpm --filter @repo/api test` or `pnpm --filter @repo/utils test`; use `pnpm test` for cross-workspace changes.
6. Finish with `pnpm format`, `pnpm lint`, and `pnpm type-check`.

Canonical references: `packages/api/modules/ai/procedures/stream-message.test.ts` demonstrates real input/context and dependency isolation; `packages/api/orpc/procedures.test.ts` directly tests public, protected, and admin middleware.

## Done

Tests exercise the real oRPC call boundary, expose the regression, isolate external services, assert blocked side effects, and clean mock/global/env state.

## Common mistakes

- Mocking after importing the subject.
- Calling a handler function directly and bypassing oRPC input/context/middleware.
- Calling PostgreSQL, mail, or AI in unit tests.
