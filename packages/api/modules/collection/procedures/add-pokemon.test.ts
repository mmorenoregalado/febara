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
	addPokemonToCollection: vi.fn(),
}));

import { addPokemonToCollection } from "@repo/database";

vi.mock("../../pokemon/lib/poke-api-client", () => ({
	fetchPokemonByIdOrName: vi.fn(),
	toPokemonSummary: vi.fn(),
}));

import { PokeApiNotFoundError } from "../../pokemon/lib/errors";
import { fetchPokemonByIdOrName, toPokemonSummary } from "../../pokemon/lib/poke-api-client";
import { addPokemon } from "./add-pokemon";

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

describe("addPokemon", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("rejects unauthenticated callers", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(null);

		await expect(
			call(addPokemon, { pokemonId: 25 }, { context: { headers: new Headers() } }),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });

		expect(addPokemonToCollection).not.toHaveBeenCalled();
	});

	it("rejects invalid input", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(authenticatedSession);

		await expect(
			call(addPokemon, { pokemonId: -1 }, { context: { headers: new Headers() } }),
		).rejects.toBeDefined();

		expect(addPokemonToCollection).not.toHaveBeenCalled();
	});

	it("adds the Pokémon to the current user's collection", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(authenticatedSession);
		vi.mocked(fetchPokemonByIdOrName).mockResolvedValue({} as never);
		vi.mocked(toPokemonSummary).mockReturnValue({
			id: 25,
			name: "pikachu",
			imageUrl: "https://example.com/pikachu.png",
			types: ["electric"],
		});

		const result = await call(
			addPokemon,
			{ pokemonId: 25 },
			{ context: { headers: new Headers() } },
		);

		expect(fetchPokemonByIdOrName).toHaveBeenCalledWith("25");
		expect(addPokemonToCollection).toHaveBeenCalledWith("user-1", 25);
		expect(result).toEqual({
			id: 25,
			name: "pikachu",
			imageUrl: "https://example.com/pikachu.png",
			types: ["electric"],
		});
	});

	it("adding an already-collected Pokémon is idempotent (upsert, not a second row)", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(authenticatedSession);
		vi.mocked(fetchPokemonByIdOrName).mockResolvedValue({} as never);
		vi.mocked(toPokemonSummary).mockReturnValue({
			id: 25,
			name: "pikachu",
			imageUrl: null,
			types: [],
		});

		await call(addPokemon, { pokemonId: 25 }, { context: { headers: new Headers() } });
		await call(addPokemon, { pokemonId: 25 }, { context: { headers: new Headers() } });

		expect(addPokemonToCollection).toHaveBeenCalledTimes(2);
		expect(addPokemonToCollection).toHaveBeenNthCalledWith(1, "user-1", 25);
		expect(addPokemonToCollection).toHaveBeenNthCalledWith(2, "user-1", 25);
	});

	it("maps a nonexistent Pokémon to a NOT_FOUND error and does not persist anything", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(authenticatedSession);
		vi.mocked(fetchPokemonByIdOrName).mockRejectedValue(new PokeApiNotFoundError());

		await expect(
			call(addPokemon, { pokemonId: 999_999 }, { context: { headers: new Headers() } }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });

		expect(addPokemonToCollection).not.toHaveBeenCalled();
	});
});
