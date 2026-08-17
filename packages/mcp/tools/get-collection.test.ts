import { beforeEach, describe, expect, it, vi } from "vitest";

import { getCollectionHandler } from "./get-collection";

describe("getCollectionHandler", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", vi.fn());
	});

	it("forwards the session cookie and returns structured content on success", async () => {
		vi.mocked(fetch).mockResolvedValue(
			new Response(
				JSON.stringify([{ id: 25, name: "pikachu", imageUrl: null, types: ["electric"] }]),
				{
					status: 200,
				},
			),
		);

		const request = new Request("http://localhost/api/mcp", {
			headers: { cookie: "better-auth.session_token=abc" },
		});

		const result = await getCollectionHandler({}, { http: { req: request } });

		const [url, init] = vi.mocked(fetch).mock.calls[0] as [URL, RequestInit];
		expect(url.pathname).toBe("/api/collection");
		expect((init.headers as Record<string, string>).cookie).toBe("better-auth.session_token=abc");

		expect(result).toEqual({
			content: [
				{
					type: "text",
					text: JSON.stringify({
						pokemon: [{ id: 25, name: "pikachu", imageUrl: null, types: ["electric"] }],
					}),
				},
			],
			structuredContent: {
				pokemon: [{ id: 25, name: "pikachu", imageUrl: null, types: ["electric"] }],
			},
		});
	});

	it("returns isError when the caller has no session", async () => {
		vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 401 }));

		const result = await getCollectionHandler({}, { http: {} });

		expect(result).toEqual({
			isError: true,
			content: [
				{ type: "text", text: "No autenticado. Iniciá sesión en la app e intentá de nuevo." },
			],
		});
	});

	it("returns isError when the request to packages/api fails outright", async () => {
		vi.mocked(fetch).mockRejectedValue(new Error("network down"));

		const result = await getCollectionHandler({}, { http: {} });

		expect(result).toEqual({
			isError: true,
			content: [{ type: "text", text: "El servicio no está disponible en este momento." }],
		});
	});
});
