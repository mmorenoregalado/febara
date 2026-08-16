import type { z } from "zod";

import { db } from "../client";
import type { OrganizationSchema } from "../zod";

export async function getOrganizations({
	limit,
	offset,
	query,
}: {
	limit: number;
	offset: number;
	query?: string;
}) {
	const organizations = await db.organization.findMany({
		where: query
			? {
					OR: [
						{
							name: {
								contains: query,
								mode: "insensitive",
							},
						},
					],
				}
			: undefined,
		include: {
			_count: {
				select: {
					members: true,
				},
			},
		},
		take: limit,
		skip: offset,
	});

	return organizations.map((organization) => ({
		...organization,
		membersCount: organization._count.members,
	}));
}

export async function countAllOrganizations({ query }: { query?: string }) {
	return db.organization.count({
		where: query
			? {
					OR: [
						{
							name: {
								contains: query,
								mode: "insensitive",
							},
						},
					],
				}
			: undefined,
	});
}

export async function getOrganizationById(id: string) {
	return db.organization.findUnique({
		where: { id },
		include: {
			members: true,
			invitations: true,
		},
	});
}

export async function getInvitationById(id: string) {
	return db.invitation.findUnique({
		where: { id },
		include: {
			organization: true,
		},
	});
}

export async function getOrganizationBySlug(slug: string) {
	return db.organization.findUnique({
		where: { slug },
	});
}

export async function getMembershipsByUserIdWithOrganizationMembers(userId: string) {
	return db.member.findMany({
		where: {
			userId,
		},
		include: {
			organization: {
				include: {
					members: true,
				},
			},
		},
	});
}

export async function getOrganizationMembership(organizationId: string, userId: string) {
	return db.member.findUnique({
		where: {
			organizationId_userId: {
				organizationId,
				userId,
			},
		},
		include: {
			organization: true,
		},
	});
}

export async function getPendingInvitationByEmail(email: string) {
	return db.invitation.findFirst({
		where: {
			email,
			status: "pending",
		},
	});
}

export async function updateOrganization(
	organization: Partial<z.infer<typeof OrganizationSchema>> & { id: string },
) {
	return db.organization.update({
		where: {
			id: organization.id,
		},
		data: organization,
	});
}

export async function deleteOrganizationById(id: string) {
	return db.organization.delete({
		where: {
			id,
		},
	});
}
