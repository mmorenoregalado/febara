import { countAllUsers, getUsers, UserSchema } from "@repo/database";
import { z } from "zod";

import { adminProcedure } from "../../../orpc/procedures";

export const listUsers = adminProcedure
	.route({
		method: "GET",
		path: "/admin/users",
		tags: ["Administration"],
		summary: "List users",
	})
	.input(
		z.object({
			// RPC / JSON may send `null` for absent fields; z.string().optional() rejects null in Zod 4
			query: z
				.string()
				.nullish()
				.transform((q) => q ?? undefined),
			// Coerce: GET / OpenAPI query params are strings, not JSON numbers
			limit: z.coerce.number().min(1).max(100).default(10),
			offset: z.coerce.number().min(0).default(0),
		}),
	)
	.output(
		z.object({
			users: z.array(UserSchema),
			total: z.number().int().nonnegative(),
		}),
	)
	.handler(async ({ input: { query, limit, offset } }) => {
		const users = await getUsers({
			limit,
			offset,
			query,
		});

		const total = await countAllUsers({ query });

		return { users, total };
	});
