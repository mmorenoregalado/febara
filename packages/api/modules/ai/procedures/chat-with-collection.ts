import { streamToEventIterator } from "@orpc/client";
import { eventIterator, ORPCError } from "@orpc/server";
import {
	convertToModelMessages,
	createMCPClient,
	geminiModel,
	safeValidateUIMessages,
	stepCountIs,
	streamText,
	type UIMessageChunk,
} from "@repo/ai";
import { logger } from "@repo/logs";
import { z } from "zod";

import { config } from "../../../config";
import { protectedProcedure } from "../../../orpc/procedures";
import { McpUnavailableError, toORPCError } from "../lib/errors";

function isUIMessageChunk(value: unknown): value is UIMessageChunk {
	return (
		typeof value === "object" && value !== null && "type" in value && typeof value.type === "string"
	);
}

export const collectionChat = protectedProcedure
	.route({
		method: "POST",
		path: "/ai/collection-chat",
		tags: ["AI"],
		summary: "Chat about your Pokémon collection",
		description:
			"Stream an AI response backed by MCP tools (get_collection, search_pokemon, get_pokemon_stats) so the caller can ask natural-language questions about their collection and PokéAPI data.",
	})
	.input(
		z.object({
			messages: z.array(z.unknown()).min(1).max(100),
		}),
	)
	.output(
		eventIterator(
			z.custom<UIMessageChunk>(isUIMessageChunk, {
				message: "Invalid UI message stream chunk",
			}),
		),
	)
	.handler(async ({ input, context }) => {
		const validatedMessages = await safeValidateUIMessages({
			messages: input.messages,
		});

		if (!validatedMessages.success) {
			throw new ORPCError("BAD_REQUEST", {
				message: "Invalid chat messages",
			});
		}

		const cookie = context.headers.get("cookie");

		let mcpClient: Awaited<ReturnType<typeof createMCPClient>>;
		try {
			mcpClient = await createMCPClient({
				transport: {
					type: "http",
					url: `${config.saasUrl}/api/mcp`,
					headers: cookie ? { cookie } : {},
				},
			});
		} catch (error) {
			logger.error("Failed to connect to the collection MCP server", {
				message: error instanceof Error ? error.message : String(error),
			});
			throw toORPCError(new McpUnavailableError());
		}

		const tools = await mcpClient.tools();

		const response = streamText({
			model: geminiModel,
			messages: await convertToModelMessages(validatedMessages.data),
			tools,
			stopWhen: stepCountIs(5),
			onFinish: async () => {
				await mcpClient.close();
			},
			onError: async () => {
				await mcpClient.close();
			},
		});

		return streamToEventIterator(response.toUIMessageStream());
	});
