import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { buildTrustedOrigins, getTrustedOrigins } from "./trusted-origins";

describe("buildTrustedOrigins", () => {
	it("normalizes configured URLs to their origin", () => {
		expect(buildTrustedOrigins(["https://app.example.com/login?next=/"])).toEqual([
			"https://app.example.com",
		]);
	});

	it("drops empty, null, and undefined values", () => {
		expect(buildTrustedOrigins(["https://app.example.com", "", undefined, null])).toEqual([
			"https://app.example.com",
		]);
	});

	it("drops invalid URLs, including a wildcard", () => {
		expect(buildTrustedOrigins(["*", "not a url", "https://app.example.com"])).toEqual([
			"https://app.example.com",
		]);
	});

	it("never returns a wildcard origin (open-redirect regression guard)", () => {
		const origins = buildTrustedOrigins([
			"*",
			"https://app.example.com",
			"https://marketing.example.com",
		]);

		expect(origins).not.toContain("*");
		expect(origins).toEqual(["https://app.example.com", "https://marketing.example.com"]);
	});

	it("deduplicates origins that share the same scheme/host/port", () => {
		expect(
			buildTrustedOrigins([
				"https://app.example.com",
				"https://app.example.com/dashboard",
				"https://app.example.com/account",
			]),
		).toEqual(["https://app.example.com"]);
	});

	it("treats different ports as distinct origins", () => {
		expect(buildTrustedOrigins(["http://localhost:3000", "http://localhost:3001"])).toEqual([
			"http://localhost:3000",
			"http://localhost:3001",
		]);
	});
});

describe("getTrustedOrigins", () => {
	const envKeys = [
		"NUXT_PUBLIC_SAAS_URL",
		"NUXT_PUBLIC_SITE_URL",
		"NUXT_PUBLIC_MARKETING_URL",
		"NUXT_PUBLIC_VERCEL_URL",
		"PORT",
	] as const;
	const originalEnv: Record<string, string | undefined> = {};

	beforeEach(() => {
		for (const key of envKeys) {
			originalEnv[key] = process.env[key];
			delete process.env[key];
		}
	});

	afterEach(() => {
		for (const key of envKeys) {
			if (originalEnv[key] === undefined) {
				delete process.env[key];
			} else {
				process.env[key] = originalEnv[key];
			}
		}
	});

	it("collects and normalizes the configured public app origins", () => {
		process.env.NUXT_PUBLIC_SAAS_URL = "https://app.example.com";
		process.env.NUXT_PUBLIC_SITE_URL = "https://app.example.com";
		process.env.NUXT_PUBLIC_MARKETING_URL = "https://www.example.com/home";

		expect(getTrustedOrigins()).toEqual(["https://app.example.com", "https://www.example.com"]);
	});

	it("falls back to the localhost base URL when no app URLs are set", () => {
		process.env.PORT = "3000";

		expect(getTrustedOrigins()).toEqual(["http://localhost:3000"]);
	});

	it("never includes a wildcard", () => {
		process.env.NUXT_PUBLIC_SAAS_URL = "https://app.example.com";

		expect(getTrustedOrigins()).not.toContain("*");
	});
});
