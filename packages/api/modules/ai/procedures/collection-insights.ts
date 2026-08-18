import {
	buildCollectionInsightsPrompt,
	type CollectionInsightsLLM,
	CollectionInsightsLLMSchema,
	generateText,
	geminiModel,
	NoOutputGeneratedError,
	Output,
} from "@repo/ai";
import { getLocaleFromHeaders } from "@repo/auth";
import { listCollectionEntriesForUser } from "@repo/database";
import { config as i18nConfig, type Locale } from "@repo/i18n";
import { logger } from "@repo/logs";

import { protectedProcedure } from "../../../orpc/procedures";
import { fetchPokemonByIdOrName, toPokemonDetail } from "../../pokemon/lib/poke-api-client";
import type { PokemonStats } from "../../pokemon/lib/schemas";
import { computeTypeDistribution, computeTypeGaps } from "../lib/collection-stats";
import { GeminiInvalidResponseError, GeminiUnavailableError, toORPCError } from "../lib/errors";
import { CollectionInsightsInputSchema, CollectionInsightsOutputSchema } from "../lib/schemas";

function sumStats(stats: PokemonStats): number {
	return Object.values(stats).reduce((sum, value) => sum + value, 0);
}

const DEFAULT_GAP_REASON: Record<Locale, string> = {
	en: "This type is missing or underrepresented in your collection.",
	es: "Este tipo está ausente o subrepresentado en tu colección.",
};

export const collectionInsights = protectedProcedure
	.route({
		method: "POST",
		path: "/ai/collection-insights",
		tags: ["AI"],
		summary: "Get AI-generated insights about my collection",
		description:
			"Computes the type distribution and gaps of the caller's collection deterministically, then uses an LLM to write a narrative summary, strengths, gap explanations, and recommendations from that already-computed context.",
	})
	.input(CollectionInsightsInputSchema)
	.output(CollectionInsightsOutputSchema)
	.handler(async ({ context: { user, headers } }) => {
		const locale = getLocaleFromHeaders(headers);
		const entries = await listCollectionEntriesForUser(user.id);

		if (entries.length === 0) {
			return { hasCollection: false as const };
		}

		const settled = await Promise.allSettled(
			entries.map((entry) => fetchPokemonByIdOrName(String(entry.pokemonId)).then(toPokemonDetail)),
		);
		const enriched = settled
			.filter(
				(r): r is PromiseFulfilledResult<ReturnType<typeof toPokemonDetail>> =>
					r.status === "fulfilled",
			)
			.map((r) => r.value);

		const typesPerEntry = enriched.map((p) => p.types);
		const typeDistribution = computeTypeDistribution(typesPerEntry);
		const gaps = computeTypeGaps(typesPerEntry);

		let insights: CollectionInsightsLLM;
		try {
			const result = await generateText({
				model: geminiModel,
				output: Output.object({ schema: CollectionInsightsLLMSchema }),
				messages: [
					{
						role: "user",
						content: buildCollectionInsightsPrompt({
							entries: enriched.map((p) => ({
								name: p.name,
								types: p.types,
								totalBaseStat: sumStats(p.stats),
							})),
							typeDistribution,
							gaps,
							language: i18nConfig.locales[locale].label,
						}),
					},
				],
			});
			insights = result.output;
		} catch (error) {
			logger.error("Gemini collection insights generation failed", {
				name: error instanceof Error ? error.name : typeof error,
				message: error instanceof Error ? error.message : String(error),
			});
			throw toORPCError(
				NoOutputGeneratedError.isInstance(error)
					? new GeminiInvalidResponseError()
					: new GeminiUnavailableError(),
			);
		}

		const finalGaps = gaps.map(({ type }) => ({
			type,
			reason:
				insights.gapReasons.find((g) => g.type === type)?.reason ?? DEFAULT_GAP_REASON[locale],
		}));

		return {
			hasCollection: true as const,
			summary: insights.summary,
			typeDistribution,
			strengths: insights.strengths,
			gaps: finalGaps,
			recommendations: insights.recommendations,
		};
	});
