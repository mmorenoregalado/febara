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
	removePokemonFromCollection: vi.fn(),
}));

import { removePokemonFromCollection } from "@repo/database";

import { removePokemon } from "./remove-pokemon";

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

describe("removePokemon", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("rejects unauthenticated callers", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(null);

		await expect(
			call(removePokemon, { pokemonId: 25 }, { context: { headers: new Headers() } }),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });

		expect(removePokemonFromCollection).not.toHaveBeenCalled();
	});

	it("removes the Pokémon scoped to the current user only", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(authenticatedSession);
		vi.mocked(removePokemonFromCollection).mockResolvedValue({ count: 1 });

		const result = await call(
			removePokemon,
			{ pokemonId: 25 },
			{ context: { headers: new Headers() } },
		);

		// The delete is always scoped by the session user's id — there is no input
		// field that could carry another user's id, so cross-user deletion is
		// structurally impossible rather than something checked at runtime.
		expect(removePokemonFromCollection).toHaveBeenCalledWith("user-1", 25);
		expect(result).toEqual({ success: true });
	});

	it("succeeds even if the Pokémon was not in the collection", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(authenticatedSession);
		vi.mocked(removePokemonFromCollection).mockResolvedValue({ count: 0 });

		const result = await call(
			removePokemon,
			{ pokemonId: 25 },
			{ context: { headers: new Headers() } },
		);

		expect(result).toEqual({ success: true });
	});
});
