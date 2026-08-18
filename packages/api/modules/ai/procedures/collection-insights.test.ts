import { call } from "@orpc/server";
import type { Session } from "@repo/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@repo/auth", () => ({
	auth: {
		api: {
			getSession: vi.fn(),
		},
	},
	getLocaleFromHeaders: vi.fn(() => "en"),
}));

import { auth, getLocaleFromHeaders } from "@repo/auth";

vi.mock("@repo/ai", () => ({
	buildCollectionInsightsPrompt: vi.fn(() => "prompt"),
	CollectionInsightsLLMSchema: {},
	generateText: vi.fn(),
	geminiModel: {},
	NoOutputGeneratedError: { isInstance: vi.fn(() => false) },
	Output: { object: vi.fn(() => ({})) },
}));

import { buildCollectionInsightsPrompt, generateText, NoOutputGeneratedError } from "@repo/ai";

vi.mock("@repo/database", () => ({
	listCollectionEntriesForUser: vi.fn(),
}));

import { listCollectionEntriesForUser } from "@repo/database";

vi.mock("../../pokemon/lib/poke-api-client", () => ({
	fetchPokemonByIdOrName: vi.fn(),
	toPokemonDetail: vi.fn(),
}));

import { fetchPokemonByIdOrName, toPokemonDetail } from "../../pokemon/lib/poke-api-client";
import { collectionInsights } from "./collection-insights";

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

function pokemonDetail(name: string, types: string[]) {
	return {
		id: 1,
		name,
		imageUrl: null,
		types,
		heightM: 1,
		weightKg: 1,
		abilities: [],
		stats: { hp: 10, attack: 10, defense: 10, specialAttack: 10, specialDefense: 10, speed: 10 },
	};
}

describe("collectionInsights", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(auth.api.getSession).mockResolvedValue(authenticatedSession);
		vi.mocked(NoOutputGeneratedError).isInstance.mockReturnValue(false);
		vi.mocked(getLocaleFromHeaders).mockReturnValue("en");
	});

	it("rejects unauthenticated callers", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(null);

		await expect(
			call(collectionInsights, {}, { context: { headers: new Headers() } }),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });

		expect(generateText).not.toHaveBeenCalled();
	});

	it("returns hasCollection: false without calling the LLM when the collection is empty", async () => {
		vi.mocked(listCollectionEntriesForUser).mockResolvedValue([]);

		const result = await call(collectionInsights, {}, { context: { headers: new Headers() } });

		expect(result).toEqual({ hasCollection: false });
		expect(generateText).not.toHaveBeenCalled();
	});

	it("computes gaps in code and fills in the LLM's reasons, ignoring hallucinated types", async () => {
		vi.mocked(listCollectionEntriesForUser).mockResolvedValue([
			{ id: "1", userId: "user-1", pokemonId: 4, createdAt: new Date() },
		]);
		vi.mocked(fetchPokemonByIdOrName).mockResolvedValue({} as never);
		vi.mocked(toPokemonDetail).mockReturnValue(pokemonDetail("charmander", ["fire"]));
		vi.mocked(generateText).mockResolvedValue({
			output: {
				summary: "A fire-focused collection.",
				strengths: ["Strong fire coverage"],
				gapReasons: [
					{ type: "water", reason: "No water-type coverage yet." },
					{ type: "not-a-real-type", reason: "Should be ignored." },
				],
				recommendations: [{ pokemonName: "squirtle", reason: "Adds water coverage." }],
			},
		} as never);

		const result = await call(collectionInsights, {}, { context: { headers: new Headers() } });

		expect(result).toMatchObject({
			hasCollection: true,
			summary: "A fire-focused collection.",
			typeDistribution: [{ type: "fire", count: 1 }],
			strengths: ["Strong fire coverage"],
			recommendations: [{ pokemonName: "squirtle", reason: "Adds water coverage." }],
		});

		if (result.hasCollection) {
			const waterGap = result.gaps.find((g) => g.type === "water");
			expect(waterGap).toEqual({ type: "water", reason: "No water-type coverage yet." });
			expect(result.gaps.some((g) => g.type === "not-a-real-type")).toBe(false);

			const fireGap = result.gaps.find((g) => g.type === "fire");
			expect(fireGap).toBeUndefined();

			const ungroundedGap = result.gaps.find((g) => g.type === "ghost");
			expect(ungroundedGap).toEqual({
				type: "ghost",
				reason: "This type is missing or underrepresented in your collection.",
			});
		}
	});

	it("passes the caller's locale as the language for the prompt", async () => {
		vi.mocked(listCollectionEntriesForUser).mockResolvedValue([
			{ id: "1", userId: "user-1", pokemonId: 4, createdAt: new Date() },
		]);
		vi.mocked(fetchPokemonByIdOrName).mockResolvedValue({} as never);
		vi.mocked(toPokemonDetail).mockReturnValue(pokemonDetail("charmander", ["fire"]));
		vi.mocked(generateText).mockResolvedValue({
			output: { summary: "s", strengths: [], gapReasons: [], recommendations: [] },
		} as never);
		vi.mocked(getLocaleFromHeaders).mockReturnValue("es");

		await call(collectionInsights, {}, { context: { headers: new Headers() } });

		expect(buildCollectionInsightsPrompt).toHaveBeenCalledWith(
			expect.objectContaining({ language: "Español" }),
		);
	});

	it("falls back to a Spanish default gap reason when the caller's locale is Spanish", async () => {
		vi.mocked(listCollectionEntriesForUser).mockResolvedValue([
			{ id: "1", userId: "user-1", pokemonId: 4, createdAt: new Date() },
		]);
		vi.mocked(fetchPokemonByIdOrName).mockResolvedValue({} as never);
		vi.mocked(toPokemonDetail).mockReturnValue(pokemonDetail("charmander", ["fire"]));
		vi.mocked(generateText).mockResolvedValue({
			output: { summary: "s", strengths: [], gapReasons: [], recommendations: [] },
		} as never);
		vi.mocked(getLocaleFromHeaders).mockReturnValue("es");

		const result = await call(collectionInsights, {}, { context: { headers: new Headers() } });

		if (result.hasCollection) {
			const ghostGap = result.gaps.find((g) => g.type === "ghost");
			expect(ghostGap).toEqual({
				type: "ghost",
				reason: "Este tipo está ausente o subrepresentado en tu colección.",
			});
		}
	});

	it("maps a malformed LLM response to BAD_GATEWAY", async () => {
		vi.mocked(listCollectionEntriesForUser).mockResolvedValue([
			{ id: "1", userId: "user-1", pokemonId: 4, createdAt: new Date() },
		]);
		vi.mocked(fetchPokemonByIdOrName).mockResolvedValue({} as never);
		vi.mocked(toPokemonDetail).mockReturnValue(pokemonDetail("charmander", ["fire"]));
		vi.mocked(generateText).mockRejectedValue(new Error("schema mismatch"));
		vi.mocked(NoOutputGeneratedError).isInstance.mockReturnValue(true);

		await expect(
			call(collectionInsights, {}, { context: { headers: new Headers() } }),
		).rejects.toMatchObject({ code: "BAD_GATEWAY" });
	});

	it("maps a generic Gemini failure to BAD_GATEWAY", async () => {
		vi.mocked(listCollectionEntriesForUser).mockResolvedValue([
			{ id: "1", userId: "user-1", pokemonId: 4, createdAt: new Date() },
		]);
		vi.mocked(fetchPokemonByIdOrName).mockResolvedValue({} as never);
		vi.mocked(toPokemonDetail).mockReturnValue(pokemonDetail("charmander", ["fire"]));
		vi.mocked(generateText).mockRejectedValue(new Error("network error"));

		await expect(
			call(collectionInsights, {}, { context: { headers: new Headers() } }),
		).rejects.toMatchObject({ code: "BAD_GATEWAY" });
	});
});
