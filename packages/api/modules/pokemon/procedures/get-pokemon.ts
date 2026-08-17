import { z } from "zod";

import { protectedProcedure } from "../../../orpc/procedures";
import { toORPCError } from "../lib/errors";
import { fetchPokemonByIdOrName, toPokemonDetail } from "../lib/poke-api-client";
import { PokemonDetailSchema } from "../lib/schemas";

export const getPokemon = protectedProcedure
	.route({
		method: "GET",
		path: "/pokemon/{idOrName}",
		tags: ["Pokemon"],
		summary: "Get Pokémon detail",
		description: "Fetch a single Pokémon by id or name from PokéAPI",
	})
	.input(
		z.object({
			idOrName: z.string().trim().min(1),
		}),
	)
	.output(PokemonDetailSchema)
	.handler(async ({ input: { idOrName } }) => {
		try {
			const raw = await fetchPokemonByIdOrName(idOrName.toLowerCase());
			return toPokemonDetail(raw);
		} catch (error) {
			throw toORPCError(error);
		}
	});
