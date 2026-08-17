import { z } from "zod";

export const CardIdentificationSchema = z.object({
	identified: z.boolean(),
	pokemonName: z.string().nullable(),
	confidence: z.enum(["high", "medium", "low"]),
	reason: z.string().nullable(),
});

export type CardIdentification = z.infer<typeof CardIdentificationSchema>;
