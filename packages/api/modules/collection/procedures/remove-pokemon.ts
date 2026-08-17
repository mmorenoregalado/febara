import { removePokemonFromCollection } from "@repo/database";
import { z } from "zod";

import { protectedProcedure } from "../../../orpc/procedures";

export const removePokemon = protectedProcedure
	.route({
		method: "DELETE",
		path: "/collection/{pokemonId}",
		tags: ["Collection"],
		summary: "Remove a Pokémon from my collection",
		description: "Removes a Pokémon from the current user's collection, if present.",
	})
	.input(
		z.object({
			pokemonId: z.coerce.number().int().positive(),
		}),
	)
	.output(z.object({ success: z.literal(true) }))
	.handler(async ({ input: { pokemonId }, context: { user } }) => {
		await removePokemonFromCollection(user.id, pokemonId);
		return { success: true };
	});
