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
	fetchPokemonNameIndex: vi.fn(),
	fetchPokemonByIdOrName: vi.fn(),
	toPokemonSummary: vi.fn(),
}));

import { PokeApiUnavailableError } from "../lib/errors";
import {
	fetchPokemonByIdOrName,
	fetchPokemonNameIndex,
	toPokemonSummary,
} from "../lib/poke-api-client";
import { listPokemon } from "./list-pokemon";

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

const NAME_INDEX = [
	{ name: "bulbasaur", url: "" },
	{ name: "ivysaur", url: "" },
	{ name: "venusaur", url: "" },
	{ name: "charmander", url: "" },
];

function summaryFor(name: string) {
	return { id: 1, name, imageUrl: null, types: [] };
}

describe("listPokemon", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(fetchPokemonNameIndex).mockResolvedValue(NAME_INDEX);
		vi.mocked(fetchPokemonByIdOrName).mockImplementation((name) =>
			Promise.resolve({ name } as never),
		);
		vi.mocked(toPokemonSummary).mockImplementation((raw) =>
			summaryFor((raw as { name: string }).name),
		);
	});

	it("rejects unauthenticated callers", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(null);

		await expect(
			call(
				listPokemon,
				{ query: null, limit: 20, offset: 0 },
				{ context: { headers: new Headers() } },
			),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("filters by substring and reports the filtered total", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(authenticatedSession);

		const result = await call(
			listPokemon,
			{ query: "saur", limit: 20, offset: 0 },
			{ context: { headers: new Headers() } },
		);

		expect(result.total).toBe(3);
		expect(result.pokemon.map((p) => p.name)).toEqual(["bulbasaur", "ivysaur", "venusaur"]);
	});

	it("paginates the filtered results using limit/offset", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(authenticatedSession);

		const result = await call(
			listPokemon,
			{ query: null, limit: 2, offset: 2 },
			{ context: { headers: new Headers() } },
		);

		expect(result.total).toBe(4);
		expect(result.pokemon.map((p) => p.name)).toEqual(["venusaur", "charmander"]);
	});

	it("skips page items whose detail fetch fails instead of failing the whole page", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(authenticatedSession);
		vi.mocked(fetchPokemonByIdOrName).mockImplementation((name) =>
			name === "ivysaur"
				? Promise.reject(new PokeApiUnavailableError())
				: Promise.resolve({ name } as never),
		);

		const result = await call(
			listPokemon,
			{ query: null, limit: 3, offset: 0 },
			{ context: { headers: new Headers() } },
		);

		expect(result.total).toBe(4);
		expect(result.pokemon.map((p) => p.name)).toEqual(["bulbasaur", "venusaur"]);
	});
});
