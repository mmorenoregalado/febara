import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";

import { callApi, cookieFromRequest } from "../lib/api-client";
import { PokemonDetailSchema } from "../lib/schemas";

const InputSchema = z.object({
	idOrName: z.string().trim().min(1).describe('Pokémon id or name, e.g. "25" or "pikachu".'),
});

export async function getPokemonStatsHandler(
	input: z.infer<typeof InputSchema>,
	ctx: { http?: { req?: Request } },
) {
	const result = await callApi<z.infer<typeof PokemonDetailSchema>>(
		`/api/pokemon/${encodeURIComponent(input.idOrName)}`,
		{ cookie: cookieFromRequest(ctx.http?.req) },
	);

	if (!result.ok) {
		return { isError: true, content: [{ type: "text" as const, text: result.message }] };
	}

	return {
		content: [{ type: "text" as const, text: JSON.stringify(result.data) }],
		structuredContent: result.data,
	};
}

export function registerGetPokemonStatsTool(server: McpServer): void {
	server.registerTool(
		"get_pokemon_stats",
		{
			title: "Get Pokémon stats",
			description:
				"Returns full detail (base stats, abilities, height, weight, types) for a single Pokémon.",
			inputSchema: InputSchema,
			outputSchema: PokemonDetailSchema,
		},
		getPokemonStatsHandler,
	);
}
