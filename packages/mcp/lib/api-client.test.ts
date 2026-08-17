import { beforeEach, describe, expect, it, vi } from "vitest";

import { callApi } from "./api-client";

describe("callApi", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", vi.fn());
	});

	it("defaults to GET with no body and the configured timeout", async () => {
		vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
		const timeoutSpy = vi.spyOn(AbortSignal, "timeout");

		await callApi("/api/collection", { cookie: null });

		const [, init] = vi.mocked(fetch).mock.calls[0] as [URL, RequestInit];
		expect(init.method).toBe("GET");
		expect(init.body).toBeUndefined();
		expect(timeoutSpy).toHaveBeenCalledWith(5000);
	});

	it("POSTs a JSON body with content-type when a body is given, using the custom timeout", async () => {
		vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
		const timeoutSpy = vi.spyOn(AbortSignal, "timeout");

		await callApi("/api/ai/identify-pokemon-card", {
			cookie: null,
			body: { foo: "bar" },
			timeoutMs: 30_000,
		});

		const [, init] = vi.mocked(fetch).mock.calls[0] as [URL, RequestInit];
		expect(init.method).toBe("POST");
		expect((init.headers as Record<string, string>)["content-type"]).toBe("application/json");
		expect(init.body).toBe(JSON.stringify({ foo: "bar" }));
		expect(timeoutSpy).toHaveBeenCalledWith(30_000);
	});

	it("maps 400 and 413 to descriptive messages", async () => {
		vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 400 }));
		await expect(callApi("/api/ai/identify-pokemon-card", { cookie: null })).resolves.toEqual({
			ok: false,
			message: "La imagen no es válida.",
		});

		vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 413 }));
		await expect(callApi("/api/ai/identify-pokemon-card", { cookie: null })).resolves.toEqual({
			ok: false,
			message: "La imagen es demasiado grande (máximo 10 MB).",
		});
	});
});
