import { ORPCError } from "@orpc/server";
import { getOrganizationById, updateOrganization } from "@repo/database";
import { checkPermission } from "@repo/permissions";
import { deleteFile, isStoragePath } from "@repo/storage";
import z from "zod";

import { protectedProcedure } from "../../../orpc/procedures";
import { verifyOrganizationMembership } from "../lib/membership";

export const deleteLogo = protectedProcedure
	.route({
		method: "DELETE",
		path: "/organizations/logo",
		tags: ["Organizations"],
		summary: "Delete organization logo",
		description: "Remove the active organization's logo from storage and clear it from the profile",
	})
	.input(
		z.object({
			organizationId: z.string(),
		}),
	)
	.handler(async ({ context: { user }, input: { organizationId } }) => {
		const organization = await getOrganizationById(organizationId);

		if (!organization) {
			throw new ORPCError("BAD_REQUEST");
		}

		const membership = await verifyOrganizationMembership(organization.id, user.id);
		if (
			!checkPermission(
				{
					user,
					membershipRole: membership?.role,
				},
				"organization.manage",
			)
		) {
			throw new ORPCError("FORBIDDEN");
		}

		const logoPath = organization.logo;

		if (isStoragePath(logoPath)) {
			await deleteFile(logoPath, {
				bucket: "avatars",
			});
		}

		await updateOrganization({
			id: organization.id,
			logo: null,
		});

		return { success: true };
	});
