import { call } from "@orpc/server";
import type { Session } from "@repo/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@repo/auth", () => ({
	auth: {
		api: {
			getSession: vi.fn(),
		},
	},
}));

import { auth } from "@repo/auth";

vi.mock("@repo/database", () => ({
	isPokemonInCollection: vi.fn(),
}));

import { isPokemonInCollection } from "@repo/database";

import { containsPokemon } from "./contains-pokemon";

const authenticatedSession = {
	session: {
		id: "session-1",
		createdAt: new Date(),
		updatedAt: new Date(),
		userId: "user-1",
		expiresAt: new Date(Date.now() + 60_000),
		token: "session-token",
		ipAddress: null,
		userAgent: null,
		impersonatedBy: null,
		activeOrganizationId: null,
	},
	user: {
		id: "user-1",
		name: "Test User",
		email: "test@example.com",
		emailVerified: true,
		image: null,
		createdAt: new Date(),
		updatedAt: new Date(),
		role: "user",
		banned: null,
		banReason: null,
		banExpires: null,
		onboardingComplete: true,
		locale: null,
		twoFactorEnabled: false,
		lastActiveOrganizationId: null,
	},
} satisfies Session;

describe("containsPokemon", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("rejects unauthenticated callers", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(null);

		await expect(
			call(containsPokemon, { pokemonId: 25 }, { context: { headers: new Headers() } }),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("returns exists: true when the Pokémon is in the current user's collection", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(authenticatedSession);
		vi.mocked(isPokemonInCollection).mockResolvedValue(true);

		const result = await call(
			containsPokemon,
			{ pokemonId: 25 },
			{ context: { headers: new Headers() } },
		);

		expect(isPokemonInCollection).toHaveBeenCalledWith("user-1", 25);
		expect(result).toEqual({ exists: true });
	});

	it("returns exists: false when the Pokémon is not in the collection", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(authenticatedSession);
		vi.mocked(isPokemonInCollection).mockResolvedValue(false);

		const result = await call(
			containsPokemon,
			{ pokemonId: 999 },
			{ context: { headers: new Headers() } },
		);

		expect(result).toEqual({ exists: false });
	});
});
