import { ORPCError } from "@orpc/client";
import {
	getOrganizationById,
	updateOrganization as updateOrganizationRecord,
} from "@repo/database";
import { z } from "zod";

import { adminProcedure } from "../../../orpc/procedures";

export const updateOrganization = adminProcedure
	.route({
		method: "PATCH",
		path: "/admin/organizations/{id}",
		tags: ["Administration"],
		summary: "Update organization",
	})
	.input(
		z.object({
			id: z.string(),
			name: z.string().trim().min(3),
		}),
	)
	.handler(async ({ input: { id, name } }) => {
		const organization = await getOrganizationById(id);

		if (!organization) {
			throw new ORPCError("NOT_FOUND");
		}

		return await updateOrganizationRecord({
			id,
			name,
		});
	});
