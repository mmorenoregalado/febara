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
	listCollectionEntriesForUser: vi.fn(),
}));

import { listCollectionEntriesForUser } from "@repo/database";

vi.mock("../../pokemon/lib/poke-api-client", () => ({
	fetchPokemonByIdOrName: vi.fn(),
	toPokemonSummary: vi.fn(),
}));

import { fetchPokemonByIdOrName, toPokemonSummary } from "../../pokemon/lib/poke-api-client";
import { listCollection } from "./list-collection";

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

describe("listCollection", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("rejects unauthenticated callers", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(null);

		await expect(
			call(listCollection, undefined, { context: { headers: new Headers() } }),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });

		expect(listCollectionEntriesForUser).not.toHaveBeenCalled();
	});

	it("returns the collection for the current user, resolved against PokéAPI", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(authenticatedSession);
		vi.mocked(listCollectionEntriesForUser).mockResolvedValue([
			{
				id: "entry-1",
				userId: "user-1",
				pokemonId: 25,
				createdAt: new Date(),
			},
		]);
		vi.mocked(fetchPokemonByIdOrName).mockResolvedValue({} as never);
		vi.mocked(toPokemonSummary).mockReturnValue({
			id: 25,
			name: "pikachu",
			imageUrl: "https://example.com/pikachu.png",
			types: ["electric"],
		});

		const result = await call(listCollection, undefined, {
			context: { headers: new Headers() },
		});

		expect(listCollectionEntriesForUser).toHaveBeenCalledWith("user-1");
		expect(fetchPokemonByIdOrName).toHaveBeenCalledWith("25");
		expect(result).toEqual([
			{
				id: 25,
				name: "pikachu",
				imageUrl: "https://example.com/pikachu.png",
				types: ["electric"],
			},
		]);
	});

	it("omits collection entries that no longer resolve against PokéAPI", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(authenticatedSession);
		vi.mocked(listCollectionEntriesForUser).mockResolvedValue([
			{ id: "entry-1", userId: "user-1", pokemonId: 25, createdAt: new Date() },
			{ id: "entry-2", userId: "user-1", pokemonId: 99_999, createdAt: new Date() },
		]);
		vi.mocked(fetchPokemonByIdOrName).mockImplementation(async (idOrName) => {
			if (idOrName === "99999") {
				throw new Error("not found");
			}
			return {} as never;
		});
		vi.mocked(toPokemonSummary).mockReturnValue({
			id: 25,
			name: "pikachu",
			imageUrl: null,
			types: [],
		});

		const result = await call(listCollection, undefined, {
			context: { headers: new Headers() },
		});

		expect(result).toHaveLength(1);
		expect(result[0]?.id).toBe(25);
	});
});
