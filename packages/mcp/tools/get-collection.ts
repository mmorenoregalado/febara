import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";

import { callApi, cookieFromRequest } from "../lib/api-client";
import { PokemonSummarySchema } from "../lib/schemas";

const InputSchema = z.object({});
const OutputSchema = z.object({ pokemon: z.array(PokemonSummarySchema) });

export async function getCollectionHandler(
	_input: z.infer<typeof InputSchema>,
	ctx: { http?: { req?: Request } },
) {
	const result = await callApi<z.infer<typeof PokemonSummarySchema>[]>("/api/collection", {
		cookie: cookieFromRequest(ctx.http?.req),
	});

	if (!result.ok) {
		return { isError: true, content: [{ type: "text" as const, text: result.message }] };
	}

	const output = { pokemon: result.data };
	return {
		content: [{ type: "text" as const, text: JSON.stringify(output) }],
		structuredContent: output,
	};
}

export function registerGetCollectionTool(server: McpServer): void {
	server.registerTool(
		"get_collection",
		{
			title: "Get collection",
			description:
				"Returns the Pokémon the authenticated user has added to their personal collection.",
			inputSchema: InputSchema,
			outputSchema: OutputSchema,
		},
		getCollectionHandler,
	);
}
