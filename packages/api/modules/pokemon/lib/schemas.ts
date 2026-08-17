import { z } from "zod";

export const PokemonSummarySchema = z.object({
	id: z.number().int().positive(),
	name: z.string(),
	imageUrl: z.string().nullable(),
	types: z.array(z.string()),
});

export const PokemonStatsSchema = z.object({
	hp: z.number().int().nonnegative(),
	attack: z.number().int().nonnegative(),
	defense: z.number().int().nonnegative(),
	specialAttack: z.number().int().nonnegative(),
	specialDefense: z.number().int().nonnegative(),
	speed: z.number().int().nonnegative(),
});

export const PokemonDetailSchema = PokemonSummarySchema.extend({
	heightM: z.number().positive(),
	weightKg: z.number().positive(),
	abilities: z.array(z.string()),
	stats: PokemonStatsSchema,
});

export type PokemonSummary = z.infer<typeof PokemonSummarySchema>;
export type PokemonStats = z.infer<typeof PokemonStatsSchema>;
export type PokemonDetail = z.infer<typeof PokemonDetailSchema>;
