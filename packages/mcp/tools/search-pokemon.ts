import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";

import { callApi, cookieFromRequest } from "../lib/api-client";
import { PokemonSummarySchema } from "../lib/schemas";

const InputSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1)
		.optional()
		.describe('Substring to match against Pokémon names, e.g. "char".'),
	type: z
		.string()
		.trim()
		.min(1)
		.optional()
		.describe('Pokémon type to filter by, e.g. "water" or "fire".'),
	limit: z.number().int().min(1).max(50).default(20),
});

const OutputSchema = z.object({
	pokemon: z.array(PokemonSummarySchema),
	total: z.number().int().nonnegative(),
});

export async function searchPokemonHandler(
	input: z.infer<typeof InputSchema>,
	ctx: { http?: { req?: Request } },
) {
	const result = await callApi<z.infer<typeof OutputSchema>>("/api/pokemon", {
		cookie: cookieFromRequest(ctx.http?.req),
		searchParams: {
			query: input.name,
			type: input.type,
			limit: String(input.limit),
		},
	});

	if (!result.ok) {
		return { isError: true, content: [{ type: "text" as const, text: result.message }] };
	}

	return {
		content: [{ type: "text" as const, text: JSON.stringify(result.data) }],
		structuredContent: result.data,
	};
}

export function registerSearchPokemonTool(server: McpServer): void {
	server.registerTool(
		"search_pokemon",
		{
			title: "Search Pokémon",
			description:
				"Searches the full PokéAPI catalog (not just the user's collection) by name substring and/or type.",
			inputSchema: InputSchema,
			outputSchema: OutputSchema,
		},
		searchPokemonHandler,
	);
}
