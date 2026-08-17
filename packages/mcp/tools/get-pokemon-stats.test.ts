import { beforeEach, describe, expect, it, vi } from "vitest";

import { getPokemonStatsHandler } from "./get-pokemon-stats";

describe("getPokemonStatsHandler", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", vi.fn());
	});

	it("calls /api/pokemon/{idOrName} url-encoded and returns structured content", async () => {
		const body = {
			id: 25,
			name: "pikachu",
			imageUrl: null,
			types: ["electric"],
			heightM: 0.4,
			weightKg: 6,
			abilities: ["static"],
			stats: { hp: 35, attack: 55, defense: 40, specialAttack: 50, specialDefense: 50, speed: 90 },
		};
		vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(body), { status: 200 }));

		const result = await getPokemonStatsHandler({ idOrName: "Mr. Mime" }, { http: {} });

		const [url] = vi.mocked(fetch).mock.calls[0] as [URL];
		expect(url.pathname).toBe("/api/pokemon/Mr.%20Mime");
		expect(result).toEqual({
			content: [{ type: "text", text: JSON.stringify(body) }],
			structuredContent: body,
		});
	});

	it("returns isError when the Pokémon does not exist", async () => {
		vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 404 }));

		const result = await getPokemonStatsHandler({ idOrName: "not-a-pokemon" }, { http: {} });

		expect(result).toEqual({
			isError: true,
			content: [{ type: "text", text: "No se encontró el recurso solicitado." }],
		});
	});
});
