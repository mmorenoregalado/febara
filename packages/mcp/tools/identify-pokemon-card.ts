import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";

import { callApi, cookieFromRequest } from "../lib/api-client";
import { IdentifyCardOutputSchema } from "../lib/schemas";

const InputSchema = z.object({
	imageBase64: z
		.string()
		.min(1)
		.describe("Base64-encoded photo of a physical Pokémon trading card."),
	mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
});

// Vision LLM calls run longer than a plain PokéAPI lookup, so this needs a
// higher timeout than callApi's default.
const IDENTIFY_TIMEOUT_MS = 30_000;

export async function identifyPokemonCardHandler(
	input: z.infer<typeof InputSchema>,
	ctx: { http?: { req?: Request } },
) {
	const result = await callApi<z.infer<typeof IdentifyCardOutputSchema>>(
		"/api/ai/identify-pokemon-card",
		{
			cookie: cookieFromRequest(ctx.http?.req),
			body: input,
			timeoutMs: IDENTIFY_TIMEOUT_MS,
		},
	);

	if (!result.ok) {
		return { isError: true, content: [{ type: "text" as const, text: result.message }] };
	}

	return {
		content: [{ type: "text" as const, text: JSON.stringify(result.data) }],
		structuredContent: result.data,
	};
}

export function registerIdentifyPokemonCardTool(server: McpServer): void {
	server.registerTool(
		"identify_pokemon_card",
		{
			title: "Identify Pokémon card",
			description:
				"Identifies which Pokémon species is shown in a photo of a physical trading card, using a multimodal LLM cross-validated against PokéAPI.",
			inputSchema: InputSchema,
			outputSchema: IdentifyCardOutputSchema,
		},
		identifyPokemonCardHandler,
	);
}
