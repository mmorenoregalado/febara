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
	getCollectedPokemonIds: vi.fn(),
}));

import { getCollectedPokemonIds } from "@repo/database";

import { containsManyPokemon } from "./contains-many-pokemon";

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

describe("containsManyPokemon", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("rejects unauthenticated callers", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(null);

		await expect(
			call(containsManyPokemon, { pokemonIds: [25] }, { context: { headers: new Headers() } }),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });

		expect(getCollectedPokemonIds).not.toHaveBeenCalled();
	});

	it("returns the subset of ids present in the current user's collection", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(authenticatedSession);
		vi.mocked(getCollectedPokemonIds).mockResolvedValue([25]);

		const result = await call(
			containsManyPokemon,
			{ pokemonIds: [25, 26, 27] },
			{ context: { headers: new Headers() } },
		);

		expect(getCollectedPokemonIds).toHaveBeenCalledWith("user-1", [25, 26, 27]);
		expect(result).toEqual({ pokemonIds: [25] });
	});
});
