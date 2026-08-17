import { addPokemonToCollection } from "@repo/database";
import { z } from "zod";

import { protectedProcedure } from "../../../orpc/procedures";
import { toORPCError } from "../../pokemon/lib/errors";
import { fetchPokemonByIdOrName, toPokemonSummary } from "../../pokemon/lib/poke-api-client";
import { PokemonSummarySchema } from "../../pokemon/lib/schemas";

export const addPokemon = protectedProcedure
	.route({
		method: "POST",
		path: "/collection",
		tags: ["Collection"],
		summary: "Add a Pokémon to my collection",
		description:
			"Adds a Pokémon to the current user's collection. Adding a Pokémon that is already in the collection is a no-op.",
	})
	.input(
		z.object({
			pokemonId: z.number().int().positive(),
		}),
	)
	.output(PokemonSummarySchema)
	.handler(async ({ input: { pokemonId }, context: { user } }) => {
		let summary: z.infer<typeof PokemonSummarySchema>;
		try {
			const raw = await fetchPokemonByIdOrName(String(pokemonId));
			summary = toPokemonSummary(raw);
		} catch (error) {
			throw toORPCError(error);
		}

		await addPokemonToCollection(user.id, pokemonId);

		return summary;
	});
