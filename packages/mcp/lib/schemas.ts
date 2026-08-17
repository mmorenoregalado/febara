import { z } from "zod";

/**
 * Mirrors the wire shape of `packages/api/modules/pokemon/lib/schemas.ts`.
 * Kept as an independent copy (not imported from `@repo/api`) so this
 * package has no dependency on `packages/api` — importing it here would
 * create a dependency cycle, since `packages/api` mounts `@repo/mcp`.
 */
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
