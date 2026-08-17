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

import { collectionChat } from "./chat-with-collection";

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

describe("collectionChat", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("rejects unauthenticated callers", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(null);

		await expect(
			call(
				collectionChat,
				{ messages: [{ role: "user", parts: [{ type: "text", text: "hi" }] }] },
				{ context: { headers: new Headers() } },
			),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("rejects malformed UI messages before connecting to the MCP server", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(authenticatedSession);

		await expect(
			call(
				collectionChat,
				{ messages: [{ role: "user" }] },
				{ context: { headers: new Headers() } },
			),
		).rejects.toMatchObject({
			code: "BAD_REQUEST",
			message: "Invalid chat messages",
		});
	});

	it("rejects empty message histories at the input boundary", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue(authenticatedSession);

		await expect(
			call(collectionChat, { messages: [] }, { context: { headers: new Headers() } }),
		).rejects.toBeDefined();
	});
});
