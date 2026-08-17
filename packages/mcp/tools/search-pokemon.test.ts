import { beforeEach, describe, expect, it, vi } from "vitest";

import { searchPokemonHandler } from "./search-pokemon";

describe("searchPokemonHandler", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", vi.fn());
	});

	it("builds query params from name/type/limit and forwards the cookie", async () => {
		const body = {
			pokemon: [{ id: 7, name: "squirtle", imageUrl: null, types: ["water"] }],
			total: 1,
		};
		vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(body), { status: 200 }));

		const request = new Request("http://localhost/api/mcp", {
			headers: { cookie: "better-auth.session_token=abc" },
		});

		const result = await searchPokemonHandler(
			{ name: "squ", type: "water", limit: 10 },
			{ http: { req: request } },
		);

		const [url, init] = vi.mocked(fetch).mock.calls[0] as [URL, RequestInit];
		expect(url.pathname).toBe("/api/pokemon");
		expect(url.searchParams.get("query")).toBe("squ");
		expect(url.searchParams.get("type")).toBe("water");
		expect(url.searchParams.get("limit")).toBe("10");
		expect((init.headers as Record<string, string>).cookie).toBe("better-auth.session_token=abc");

		expect(result).toEqual({
			content: [{ type: "text", text: JSON.stringify(body) }],
			structuredContent: body,
		});
	});

	it("omits undefined filters from the query string", async () => {
		vi.mocked(fetch).mockResolvedValue(
			new Response(JSON.stringify({ pokemon: [], total: 0 }), { status: 200 }),
		);

		await searchPokemonHandler({ limit: 20 }, { http: {} });

		const [url] = vi.mocked(fetch).mock.calls[0] as [URL];
		expect(url.searchParams.has("query")).toBe(false);
		expect(url.searchParams.has("type")).toBe(false);
	});

	it("returns isError on a non-ok response", async () => {
		vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }));

		const result = await searchPokemonHandler({ limit: 20 }, { http: {} });

		expect(result).toEqual({
			isError: true,
			content: [{ type: "text", text: "El servicio no está disponible en este momento." }],
		});
	});
});
