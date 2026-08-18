import { z } from "zod";

import { PokemonDetailSchema } from "../../pokemon/lib/schemas";

export const IdentifyCardInputSchema = z.object({
	imageBase64: z.string().min(1),
	mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
});

export const IdentifyCardOutputSchema = z.discriminatedUnion("identified", [
	z.object({
		identified: z.literal(true),
		confidence: z.enum(["high", "medium", "low"]),
		pokemon: PokemonDetailSchema,
	}),
	z.object({
		identified: z.literal(false),
		confidence: z.enum(["high", "medium", "low"]).nullable(),
		reason: z.string().nullable(),
	}),
]);

export type IdentifyCardOutput = z.infer<typeof IdentifyCardOutputSchema>;

export const CollectionInsightsInputSchema = z.object({});

export const CollectionInsightsOutputSchema = z.discriminatedUnion("hasCollection", [
	z.object({
		hasCollection: z.literal(false),
	}),
	z.object({
		hasCollection: z.literal(true),
		summary: z.string(),
		typeDistribution: z.array(z.object({ type: z.string(), count: z.number() })),
		strengths: z.array(z.string()),
		gaps: z.array(z.object({ type: z.string(), reason: z.string() })),
		recommendations: z.array(
			z.object({
				id: z.number().optional(),
				pokemonName: z.string(),
				reason: z.string(),
				imageUrl: z.string().nullable().optional(),
				types: z.array(z.string()).optional(),
			}),
		),
	}),
]);

export type CollectionInsightsOutput = z.infer<typeof CollectionInsightsOutputSchema>;
