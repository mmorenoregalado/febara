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

vi.mock("@repo/ai", () => ({
	buildCardIdentificationPrompt: vi.fn(() => "prompt"),
	CardIdentificationSchema: {},
	generateText: vi.fn(),
	identifyCardModel: {},
	NoOutputGeneratedError: { isInstance: vi.fn(() => false) },
	Output: { object: vi.fn(() => ({})) },
}));

import { generateText, NoOutputGeneratedError } from "@repo/ai";

vi.mock("../../pokemon/lib/poke-api-client", () => ({
	fetchPokemonByIdOrName: vi.fn(),
	toPokemonDetail: vi.fn(),
}));

import {
	PokeApiNotFoundError,
	PokeApiTimeoutError,
	PokeApiUnavailableError,
} from "../../pokemon/lib/errors";
import { fetchPokemonByIdOrName, toPokemonDetail } from "../../pokemon/lib/poke-api-client";
import { identifyPokemonCard } from "./identify-pokemon-card";

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

const validInput = {
	imageBase64: Buffer.from("fake-image-bytes").toString("base64"),
	mimeType: "image/png" as const,
};

const pokemonDetail = {
	id: 25,
	name: "pikachu",
	imageUrl: "https://example.com/pikachu.png",
	types: ["electric"],
	heightM: 0.4,
	weightKg: 6,
	abilities: ["static"],
	stats: { hp: 35, attack: 55, defense: 40, specialAttack: 50, specialDefense: 50, speed: 90 },
};

describe("identifyPokemonCard", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(auth.api.getSession).mockResolvedValue(authenticatedSession);
		vi.mocked(NoOutputGeneratedError).isInstance.mockReturnValue(false);
	});

	it("rejects unauthenticated callers", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(null);

		await expect(
			call(identifyPokemonCard, validInput, { context: { headers: new Headers() } }),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });

		expect(generateText).not.toHaveBeenCalled();
	});

	it("rejects an invalid mimeType at the input boundary", async () => {
		await expect(
			call(
				identifyPokemonCard,
				{ ...validInput, mimeType: "image/gif" as never },
				{ context: { headers: new Headers() } },
			),
		).rejects.toBeDefined();

		expect(generateText).not.toHaveBeenCalled();
	});

	it("rejects an image larger than the size limit", async () => {
		const oversized = Buffer.alloc(10 * 1024 * 1024 + 1, 1).toString("base64");

		await expect(
			call(
				identifyPokemonCard,
				{ ...validInput, imageBase64: oversized },
				{ context: { headers: new Headers() } },
			),
		).rejects.toMatchObject({ code: "PAYLOAD_TOO_LARGE" });

		expect(generateText).not.toHaveBeenCalled();
	});

	it("resolves a successful identification through PokéAPI", async () => {
		vi.mocked(generateText).mockResolvedValue({
			output: { identified: true, pokemonName: "Pikachu", confidence: "high", reason: null },
		} as never);
		vi.mocked(fetchPokemonByIdOrName).mockResolvedValue({} as never);
		vi.mocked(toPokemonDetail).mockReturnValue(pokemonDetail);

		const result = await call(identifyPokemonCard, validInput, {
			context: { headers: new Headers() },
		});

		expect(fetchPokemonByIdOrName).toHaveBeenCalledWith("pikachu");
		expect(result).toEqual({ identified: true, confidence: "high", pokemon: pokemonDetail });
	});

	it("returns a soft not-identified result when the LLM cannot identify the card", async () => {
		vi.mocked(generateText).mockResolvedValue({
			output: { identified: false, pokemonName: null, confidence: "low", reason: "blurry image" },
		} as never);

		const result = await call(identifyPokemonCard, validInput, {
			context: { headers: new Headers() },
		});

		expect(result).toEqual({ identified: false, confidence: "low", reason: "blurry image" });
		expect(fetchPokemonByIdOrName).not.toHaveBeenCalled();
	});

	it("maps a malformed LLM response to BAD_GATEWAY", async () => {
		vi.mocked(generateText).mockRejectedValue(new Error("schema mismatch"));
		vi.mocked(NoOutputGeneratedError).isInstance.mockReturnValue(true);

		await expect(
			call(identifyPokemonCard, validInput, { context: { headers: new Headers() } }),
		).rejects.toMatchObject({ code: "BAD_GATEWAY" });
	});

	it("maps a generic Gemini failure to BAD_GATEWAY", async () => {
		vi.mocked(generateText).mockRejectedValue(new Error("network error"));

		await expect(
			call(identifyPokemonCard, validInput, { context: { headers: new Headers() } }),
		).rejects.toMatchObject({ code: "BAD_GATEWAY" });
	});

	it("returns a soft not-identified result when PokéAPI cannot resolve the identified name", async () => {
		vi.mocked(generateText).mockResolvedValue({
			output: {
				identified: true,
				pokemonName: "not-a-real-pokemon",
				confidence: "medium",
				reason: null,
			},
		} as never);
		vi.mocked(fetchPokemonByIdOrName).mockRejectedValue(new PokeApiNotFoundError());

		const result = await call(identifyPokemonCard, validInput, {
			context: { headers: new Headers() },
		});

		expect(result).toEqual({ identified: false, confidence: "medium", reason: null });
	});

	it("propagates a real PokéAPI infrastructure failure instead of a soft result", async () => {
		vi.mocked(generateText).mockResolvedValue({
			output: { identified: true, pokemonName: "pikachu", confidence: "high", reason: null },
		} as never);
		vi.mocked(fetchPokemonByIdOrName).mockRejectedValue(new PokeApiTimeoutError());

		await expect(
			call(identifyPokemonCard, validInput, { context: { headers: new Headers() } }),
		).rejects.toMatchObject({ code: "GATEWAY_TIMEOUT" });
	});

	it("maps a PokéAPI service outage to BAD_GATEWAY", async () => {
		vi.mocked(generateText).mockResolvedValue({
			output: { identified: true, pokemonName: "pikachu", confidence: "high", reason: null },
		} as never);
		vi.mocked(fetchPokemonByIdOrName).mockRejectedValue(new PokeApiUnavailableError(500));

		await expect(
			call(identifyPokemonCard, validInput, { context: { headers: new Headers() } }),
		).rejects.toMatchObject({ code: "BAD_GATEWAY" });
	});
});
