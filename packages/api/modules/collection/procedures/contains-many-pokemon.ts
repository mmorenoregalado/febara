import { getCollectedPokemonIds } from "@repo/database";
import { z } from "zod";

import { protectedProcedure } from "../../../orpc/procedures";

export const containsManyPokemon = protectedProcedure
	.route({
		method: "POST",
		path: "/collection/exists-many",
		tags: ["Collection"],
		summary: "Check collection membership for multiple Pokémon",
		description: "Returns which of the given Pokémon ids belong to the current user's collection.",
	})
	.input(
		z.object({
			pokemonIds: z.array(z.coerce.number().int().positive()).min(1).max(100),
		}),
	)
	.output(z.object({ pokemonIds: z.array(z.number()) }))
	.handler(async ({ input: { pokemonIds }, context: { user } }) => {
		const collectedIds = await getCollectedPokemonIds(user.id, pokemonIds);
		return { pokemonIds: collectedIds };
	});
