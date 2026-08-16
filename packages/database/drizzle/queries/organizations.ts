import { and, eq, ilike, or, sql } from "drizzle-orm";
import type { z } from "zod";

import { db } from "../client";
import { member, organization } from "../schema/postgres";
import type { OrganizationUpdateSchema } from "../zod";

export async function getOrganizations({
	limit,
	offset,
	query,
}: {
	limit: number;
	offset: number;
	query?: string;
}) {
	return db.query.organization.findMany({
		where: query ? (org, { ilike, or }) => or(ilike(org.name, `%${query}%`)) : undefined,
		limit,
		offset,
		extras: {
			membersCount:
				sql<number>`(SELECT COUNT(*)::int FROM ${member} WHERE ${sql.raw('"member"."organizationId"')} = ${organization.id})`.as(
					"membersCount",
				),
		},
	});
}

export async function countAllOrganizations({ query }: { query?: string }) {
	const result = await db
		.select({ count: sql<number>`count(*)` })
		.from(organization)
		.where(query ? or(ilike(organization.name, `%${query}%`)) : undefined);
	return Number(result[0]?.count ?? 0);
}

export async function getOrganizationById(id: string) {
	return db.query.organization.findFirst({
		where: (org, { eq }) => eq(org.id, id),
		with: {
			members: true,
			invitations: true,
		},
	});
}

export async function getInvitationById(id: string) {
	return db.query.invitation.findFirst({
		where: (invitation, { eq }) => eq(invitation.id, id),
		with: {
			organization: true,
		},
	});
}

export async function getOrganizationBySlug(slug: string) {
	return db.query.organization.findFirst({
		where: (org, { eq }) => eq(org.slug, slug),
	});
}

export async function getMembershipsByUserIdWithOrganizationMembers(userId: string) {
	return db.query.member.findMany({
		where: (member, { eq }) => eq(member.userId, userId),
		with: {
			organization: {
				with: {
					members: true,
				},
			},
		},
	});
}

export async function getOrganizationMembership(organizationId: string, userId: string) {
	return db.query.member.findFirst({
		where: (member, { eq }) =>
			and(eq(member.organizationId, organizationId), eq(member.userId, userId)),
		with: {
			organization: true,
		},
	});
}

export async function getPendingInvitationByEmail(email: string) {
	return db.query.invitation.findFirst({
		where: (invitation, { eq }) =>
			and(eq(invitation.email, email), eq(invitation.status, "pending")),
	});
}

export async function updateOrganization(
	updatedOrganization: z.infer<typeof OrganizationUpdateSchema>,
) {
	const [updated] = await db
		.update(organization)
		.set(updatedOrganization)
		.where(eq(organization.id, updatedOrganization.id))
		.returning();

	return updated;
}

export async function deleteOrganizationById(id: string) {
	return db.delete(organization).where(eq(organization.id, id));
}
