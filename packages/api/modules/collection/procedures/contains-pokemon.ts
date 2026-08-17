import { isPokemonInCollection } from "@repo/database";
import { z } from "zod";

import { protectedProcedure } from "../../../orpc/procedures";

export const containsPokemon = protectedProcedure
	.route({
		method: "GET",
		path: "/collection/{pokemonId}/exists",
		tags: ["Collection"],
		summary: "Check collection membership",
		description: "Returns whether a Pokémon belongs to the current user's collection.",
	})
	.input(
		z.object({
			pokemonId: z.coerce.number().int().positive(),
		}),
	)
	.output(z.object({ exists: z.boolean() }))
	.handler(async ({ input: { pokemonId }, context: { user } }) => {
		const exists = await isPokemonInCollection(user.id, pokemonId);
		return { exists };
	});
