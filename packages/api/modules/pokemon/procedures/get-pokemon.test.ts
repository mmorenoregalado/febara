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

vi.mock("../lib/poke-api-client", () => ({
	fetchPokemonByIdOrName: vi.fn(),
	toPokemonDetail: vi.fn(),
}));

import { PokeApiNotFoundError, PokeApiTimeoutError } from "../lib/errors";
import { fetchPokemonByIdOrName, toPokemonDetail } from "../lib/poke-api-client";
import { getPokemon } from "./get-pokemon";

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

describe("getPokemon", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("rejects unauthenticated callers", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(null);

		await expect(
			call(getPokemon, { idOrName: "pikachu" }, { context: { headers: new Headers() } }),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("returns the mapped Pokémon detail for an authenticated caller", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(authenticatedSession);
		vi.mocked(fetchPokemonByIdOrName).mockResolvedValue({} as never);
		vi.mocked(toPokemonDetail).mockReturnValue({
			id: 25,
			name: "pikachu",
			imageUrl: "https://example.com/pikachu.png",
			types: ["electric"],
			heightM: 0.4,
			weightKg: 6,
			abilities: ["static", "lightning-rod"],
			stats: { hp: 35, attack: 55, defense: 40, specialAttack: 50, specialDefense: 50, speed: 90 },
		});

		const result = await call(
			getPokemon,
			{ idOrName: "Pikachu" },
			{ context: { headers: new Headers() } },
		);

		expect(fetchPokemonByIdOrName).toHaveBeenCalledWith("pikachu");
		expect(result).toEqual({
			id: 25,
			name: "pikachu",
			imageUrl: "https://example.com/pikachu.png",
			types: ["electric"],
			heightM: 0.4,
			weightKg: 6,
			abilities: ["static", "lightning-rod"],
			stats: { hp: 35, attack: 55, defense: 40, specialAttack: 50, specialDefense: 50, speed: 90 },
		});
	});

	it("maps a not-found PokéAPI response to a NOT_FOUND error", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(authenticatedSession);
		vi.mocked(fetchPokemonByIdOrName).mockRejectedValue(new PokeApiNotFoundError());

		await expect(
			call(getPokemon, { idOrName: "not-a-pokemon" }, { context: { headers: new Headers() } }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("maps a PokéAPI timeout to a GATEWAY_TIMEOUT error", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(authenticatedSession);
		vi.mocked(fetchPokemonByIdOrName).mockRejectedValue(new PokeApiTimeoutError());

		await expect(
			call(getPokemon, { idOrName: "pikachu" }, { context: { headers: new Headers() } }),
		).rejects.toMatchObject({ code: "GATEWAY_TIMEOUT" });
	});
});
