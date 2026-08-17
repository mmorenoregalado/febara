import { z } from "zod";

import { protectedProcedure } from "../../../orpc/procedures";
import { toORPCError } from "../lib/errors";
import {
	fetchPokemonByIdOrName,
	fetchPokemonNameIndex,
	fetchPokemonNamesByType,
	toPokemonSummary,
} from "../lib/poke-api-client";
import { PokemonSummarySchema } from "../lib/schemas";

export const listPokemon = protectedProcedure
	.route({
		method: "GET",
		path: "/pokemon",
		tags: ["Pokemon"],
		summary: "List/search Pokémon",
		description:
			"Search Pokémon by name (substring match) and/or type, with pagination, backed by PokéAPI",
	})
	.input(
		z.object({
			// RPC / JSON may send `null` for absent fields; z.string().optional() rejects null in Zod 4
			query: z
				.string()
				.nullish()
				.transform((q) => q ?? undefined),
			type: z
				.string()
				.nullish()
				.transform((t) => t ?? undefined),
			// Coerce: GET / OpenAPI query params are strings, not JSON numbers
			limit: z.coerce.number().min(1).max(100).default(20),
			offset: z.coerce.number().min(0).default(0),
		}),
	)
	.output(
		z.object({
			pokemon: z.array(PokemonSummarySchema),
			total: z.number().int().nonnegative(),
		}),
	)
	.handler(async ({ input: { query, type, limit, offset } }) => {
		const indexPromise = type
			? fetchPokemonNamesByType(type.toLowerCase())
			: fetchPokemonNameIndex();
		const index = await indexPromise.catch((error) => {
			throw toORPCError(error);
		});

		const normalizedQuery = query?.toLowerCase().trim();
		const filtered = normalizedQuery
			? index.filter((p) => p.name.includes(normalizedQuery))
			: index;
		const page = filtered.slice(offset, offset + limit);

		const settled = await Promise.allSettled(
			page.map((p) => fetchPokemonByIdOrName(p.name).then(toPokemonSummary)),
		);
		const pokemon = settled
			.filter(
				(r): r is PromiseFulfilledResult<z.infer<typeof PokemonSummarySchema>> =>
					r.status === "fulfilled",
			)
			.map((r) => r.value);

		return { pokemon, total: filtered.length };
	});
