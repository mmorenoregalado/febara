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
