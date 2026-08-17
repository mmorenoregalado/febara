import {
	buildCardIdentificationPrompt,
	type CardIdentification,
	CardIdentificationSchema,
	generateText,
	identifyCardModel,
	NoOutputGeneratedError,
	Output,
} from "@repo/ai";
import { logger } from "@repo/logs";

import { protectedProcedure } from "../../../orpc/procedures";
import { PokeApiNotFoundError, toORPCError as toPokemonORPCError } from "../../pokemon/lib/errors";
import { fetchPokemonByIdOrName, toPokemonDetail } from "../../pokemon/lib/poke-api-client";
import { GeminiInvalidResponseError, GeminiUnavailableError, toORPCError } from "../lib/errors";
import { decodeAndValidateImage } from "../lib/image-validation";
import { IdentifyCardInputSchema, IdentifyCardOutputSchema } from "../lib/schemas";

export const identifyPokemonCard = protectedProcedure
	.route({
		method: "POST",
		path: "/ai/identify-pokemon-card",
		tags: ["AI"],
		summary: "Identify a Pokémon from a photo of a trading card",
		description:
			"Uses a multimodal LLM to identify the Pokémon species shown on a photographed trading card, then validates the identification against PokéAPI. The image is processed in memory only and is never persisted.",
	})
	.input(IdentifyCardInputSchema)
	.output(IdentifyCardOutputSchema)
	.handler(async ({ input }) => {
		let imageBuffer: Buffer;
		try {
			imageBuffer = decodeAndValidateImage(input.imageBase64);
		} catch (error) {
			throw toORPCError(error);
		}

		let identification: CardIdentification;
		try {
			const result = await generateText({
				model: identifyCardModel,
				output: Output.object({ schema: CardIdentificationSchema }),
				messages: [
					{
						role: "user",
						content: [
							{ type: "text", text: buildCardIdentificationPrompt() },
							{ type: "file", data: imageBuffer, mediaType: input.mimeType },
						],
					},
				],
			});
			identification = result.output;
		} catch (error) {
			logger.error("Gemini card identification failed", {
				name: error instanceof Error ? error.name : typeof error,
				message: error instanceof Error ? error.message : String(error),
			});
			throw toORPCError(
				NoOutputGeneratedError.isInstance(error)
					? new GeminiInvalidResponseError()
					: new GeminiUnavailableError(),
			);
		}

		if (!identification.identified || !identification.pokemonName) {
			return {
				identified: false as const,
				confidence: identification.confidence,
				reason: identification.reason,
			};
		}

		try {
			const raw = await fetchPokemonByIdOrName(identification.pokemonName.toLowerCase());
			return {
				identified: true as const,
				confidence: identification.confidence,
				pokemon: toPokemonDetail(raw),
			};
		} catch (error) {
			if (error instanceof PokeApiNotFoundError) {
				return {
					identified: false as const,
					confidence: identification.confidence,
					reason: null,
				};
			}
			throw toPokemonORPCError(error);
		}
	});
