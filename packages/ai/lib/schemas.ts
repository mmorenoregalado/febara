import { z } from "zod";

export const CardIdentificationSchema = z.object({
	identified: z.boolean(),
	pokemonName: z.string().nullable(),
	confidence: z.enum(["high", "medium", "low"]),
	reason: z.string().nullable(),
});

export type CardIdentification = z.infer<typeof CardIdentificationSchema>;

export const CollectionInsightsLLMSchema = z.object({
	summary: z.string(),
	strengths: z.array(z.string()),
	gapReasons: z.array(z.object({ type: z.string(), reason: z.string() })),
	recommendations: z.array(z.object({ pokemonName: z.string(), reason: z.string() })),
});

export type CollectionInsightsLLM = z.infer<typeof CollectionInsightsLLMSchema>;
