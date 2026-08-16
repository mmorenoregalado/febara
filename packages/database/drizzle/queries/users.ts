import { eq, ilike, or, sql } from "drizzle-orm";

import { db } from "../client";
import { account, user } from "../schema/postgres";
import type { UserUpdate } from "../zod";

export async function getUsers({
	limit,
	offset,
	query,
}: {
	limit: number;
	offset: number;
	query?: string;
}) {
	return await db.query.user.findMany({
		where: query
			? (user, { ilike, or }) => or(ilike(user.name, `%${query}%`), ilike(user.email, `%${query}%`))
			: undefined,
		limit,
		offset,
	});
}

export async function countAllUsers({ query }: { query?: string }) {
	const result = await db
		.select({ count: sql<number>`count(*)` })
		.from(user)
		.where(query ? or(ilike(user.name, `%${query}%`), ilike(user.email, `%${query}%`)) : undefined);
	return Number(result[0]?.count ?? 0);
}

export async function getUserById(id: string) {
	return await db.query.user.findFirst({
		where: (user, { eq }) => eq(user.id, id),
	});
}

export async function getUserByEmail(email: string) {
	return await db.query.user.findFirst({
		where: (user, { eq }) => eq(user.email, email),
	});
}

export async function createUser({
	email,
	name,
	role,
	emailVerified,
	onboardingComplete,
}: {
	email: string;
	name: string;
	role: "admin" | "user";
	emailVerified: boolean;
	onboardingComplete: boolean;
}) {
	const [createdUser] = await db
		.insert(user)
		.values({
			email,
			name,
			role,
			emailVerified,
			onboardingComplete,
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.returning({
			id: user.id,
		});

	if (!createdUser?.id) {
		throw new Error("Failed to create user");
	}

	const newUser = await getUserById(createdUser.id);

	return newUser;
}

export async function getAccountById(id: string) {
	return await db.query.account.findFirst({
		where: (account, { eq }) => eq(account.id, id),
	});
}

export async function getCredentialAccountByUserId(userId: string) {
	return await db.query.account.findFirst({
		where: (account, { and, eq, isNotNull }) =>
			and(
				eq(account.userId, userId),
				eq(account.providerId, "credential"),
				isNotNull(account.password),
			),
		columns: {
			id: true,
		},
	});
}

export async function createUserAccount({
	userId,
	providerId,
	accountId,
	hashedPassword,
}: {
	userId: string;
	providerId: string;
	accountId: string;
	hashedPassword?: string;
}) {
	const [createdAccount] = await db
		.insert(account)
		.values({
			userId,
			accountId,
			providerId,
			createdAt: new Date(),
			updatedAt: new Date(),
			password: hashedPassword,
		})
		.returning({
			id: account.id,
		});

	if (!createdAccount?.id) {
		throw new Error("Failed to create account");
	}

	const newAccount = await getAccountById(createdAccount.id);

	return newAccount;
}

export async function updateUser(updatedUser: UserUpdate) {
	return db.update(user).set(updatedUser).where(eq(user.id, updatedUser.id));
}
