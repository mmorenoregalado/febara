import { listCollectionEntriesForUser } from "@repo/database";
import { z } from "zod";

import { protectedProcedure } from "../../../orpc/procedures";
import { fetchPokemonByIdOrName, toPokemonSummary } from "../../pokemon/lib/poke-api-client";
import { PokemonSummarySchema } from "../../pokemon/lib/schemas";

export const listCollection = protectedProcedure
	.route({
		method: "GET",
		path: "/collection",
		tags: ["Collection"],
		summary: "List my collection",
		description: "Returns the Pokémon the current user has added to their collection",
	})
	.output(z.array(PokemonSummarySchema))
	.handler(async ({ context: { user } }) => {
		const entries = await listCollectionEntriesForUser(user.id);

		const settled = await Promise.allSettled(
			entries.map((entry) =>
				fetchPokemonByIdOrName(String(entry.pokemonId)).then(toPokemonSummary),
			),
		);

		return settled
			.filter(
				(r): r is PromiseFulfilledResult<z.infer<typeof PokemonSummarySchema>> =>
					r.status === "fulfilled",
			)
			.map((r) => r.value);
	});
