import { beforeEach, describe, expect, it, vi } from "vitest";

import { identifyPokemonCardHandler } from "./identify-pokemon-card";

describe("identifyPokemonCardHandler", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", vi.fn());
	});

	it("POSTs the image as JSON and forwards the session cookie", async () => {
		const body = {
			identified: true,
			confidence: "high",
			pokemon: {
				id: 6,
				name: "charizard",
				imageUrl: null,
				types: ["fire", "flying"],
				heightM: 1.7,
				weightKg: 90.5,
				abilities: ["blaze"],
				stats: {
					hp: 78,
					attack: 84,
					defense: 78,
					specialAttack: 109,
					specialDefense: 85,
					speed: 100,
				},
			},
		};
		vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(body), { status: 200 }));

		const request = new Request("http://localhost/api/mcp", {
			headers: { cookie: "better-auth.session_token=abc" },
		});

		const result = await identifyPokemonCardHandler(
			{ imageBase64: "ZmFrZS1pbWFnZS1ieXRlcw==", mimeType: "image/jpeg" },
			{ http: { req: request } },
		);

		const [url, init] = vi.mocked(fetch).mock.calls[0] as [URL, RequestInit];
		expect(url.pathname).toBe("/api/ai/identify-pokemon-card");
		expect(init.method).toBe("POST");
		expect((init.headers as Record<string, string>).cookie).toBe("better-auth.session_token=abc");
		expect((init.headers as Record<string, string>)["content-type"]).toBe("application/json");
		expect(JSON.parse(init.body as string)).toEqual({
			imageBase64: "ZmFrZS1pbWFnZS1ieXRlcw==",
			mimeType: "image/jpeg",
		});

		expect(result).toEqual({
			content: [{ type: "text", text: JSON.stringify(body) }],
			structuredContent: body,
		});
	});

	it("returns the identified:false shape as structured content", async () => {
		const body = { identified: false, confidence: "low", reason: "Image is too blurry" };
		vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(body), { status: 200 }));

		const result = await identifyPokemonCardHandler(
			{ imageBase64: "Zm9v", mimeType: "image/png" },
			{ http: {} },
		);

		expect(result).toEqual({
			content: [{ type: "text", text: JSON.stringify(body) }],
			structuredContent: body,
		});
	});

	it("maps an invalid-image response to isError", async () => {
		vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 400 }));

		const result = await identifyPokemonCardHandler(
			{ imageBase64: "not-really-an-image", mimeType: "image/png" },
			{ http: {} },
		);

		expect(result).toEqual({
			isError: true,
			content: [{ type: "text", text: "La imagen no es válida." }],
		});
	});

	it("maps an oversized-image response to isError", async () => {
		vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 413 }));

		const result = await identifyPokemonCardHandler(
			{ imageBase64: "Zm9v", mimeType: "image/png" },
			{ http: {} },
		);

		expect(result).toEqual({
			isError: true,
			content: [{ type: "text", text: "La imagen es demasiado grande (máximo 10 MB)." }],
		});
	});

	it("maps an unauthenticated response to isError", async () => {
		vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 401 }));

		const result = await identifyPokemonCardHandler(
			{ imageBase64: "Zm9v", mimeType: "image/png" },
			{ http: {} },
		);

		expect(result).toEqual({
			isError: true,
			content: [
				{ type: "text", text: "No autenticado. Iniciá sesión en la app e intentá de nuevo." },
			],
		});
	});
});
