import { z } from "zod";

import {
	PokeApiInvalidResponseError,
	PokeApiNotFoundError,
	PokeApiTimeoutError,
	PokeApiUnavailableError,
} from "./errors";
import type { PokemonDetail, PokemonStats, PokemonSummary } from "./schemas";

const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";
const REQUEST_TIMEOUT_MS = 5000;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

async function pokeApiFetch(path: string): Promise<unknown> {
	let response: Response;

	try {
		response = await fetch(`${POKEAPI_BASE_URL}${path}`, {
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
		});
	} catch (error) {
		if (error instanceof Error && error.name === "TimeoutError") {
			throw new PokeApiTimeoutError();
		}
		throw new PokeApiUnavailableError();
	}

	if (response.status === 404) {
		throw new PokeApiNotFoundError();
	}

	if (!response.ok) {
		throw new PokeApiUnavailableError(response.status);
	}

	try {
		return await response.json();
	} catch {
		throw new PokeApiInvalidResponseError();
	}
}

const RawPokemonListResponseSchema = z.object({
	results: z.array(z.object({ name: z.string(), url: z.string() })),
});

const RawPokemonTypeResponseSchema = z.object({
	pokemon: z.array(z.object({ pokemon: z.object({ name: z.string(), url: z.string() }) })),
});

const RawPokemonSchema = z.object({
	id: z.number(),
	name: z.string(),
	height: z.number(),
	weight: z.number(),
	types: z.array(z.object({ type: z.object({ name: z.string() }) })),
	abilities: z.array(z.object({ ability: z.object({ name: z.string() }) })),
	stats: z.array(z.object({ base_stat: z.number(), stat: z.object({ name: z.string() }) })),
	sprites: z.object({
		front_default: z.string().nullable(),
		other: z
			.object({
				"official-artwork": z.object({ front_default: z.string().nullable() }).optional(),
			})
			.optional(),
	}),
});

type RawPokemon = z.infer<typeof RawPokemonSchema>;
type PokemonIndexEntry = { name: string; url: string };

let nameIndexCache: { promise: Promise<PokemonIndexEntry[]>; cachedAt: number } | undefined;
const pokemonDetailCache = new Map<string, { promise: Promise<RawPokemon>; cachedAt: number }>();
const pokemonByTypeCache = new Map<
	string,
	{ promise: Promise<PokemonIndexEntry[]>; cachedAt: number }
>();

function isFresh(cachedAt: number): boolean {
	return Date.now() - cachedAt < CACHE_TTL_MS;
}

export function fetchPokemonNameIndex(): Promise<PokemonIndexEntry[]> {
	if (nameIndexCache && isFresh(nameIndexCache.cachedAt)) {
		return nameIndexCache.promise;
	}

	const promise = pokeApiFetch("/pokemon?limit=100000&offset=0").then((raw) => {
		try {
			return RawPokemonListResponseSchema.parse(raw).results;
		} catch {
			throw new PokeApiInvalidResponseError();
		}
	});

	nameIndexCache = { promise, cachedAt: Date.now() };
	return promise;
}

/**
 * Names of every Pokémon of a given type, via PokéAPI's `/type/{type}` endpoint —
 * cheaper than fetching every Pokémon's detail just to filter by type client-side.
 */
export function fetchPokemonNamesByType(type: string): Promise<PokemonIndexEntry[]> {
	const cached = pokemonByTypeCache.get(type);
	if (cached && isFresh(cached.cachedAt)) {
		return cached.promise;
	}

	const promise = pokeApiFetch(`/type/${type}`).then((raw) => {
		try {
			return RawPokemonTypeResponseSchema.parse(raw).pokemon.map((entry) => entry.pokemon);
		} catch {
			throw new PokeApiInvalidResponseError();
		}
	});

	pokemonByTypeCache.set(type, { promise, cachedAt: Date.now() });
	return promise;
}

export function fetchPokemonByIdOrName(idOrName: string): Promise<RawPokemon> {
	const cached = pokemonDetailCache.get(idOrName);
	if (cached && isFresh(cached.cachedAt)) {
		return cached.promise;
	}

	const promise = pokeApiFetch(`/pokemon/${idOrName}`).then((raw) => {
		try {
			return RawPokemonSchema.parse(raw);
		} catch {
			throw new PokeApiInvalidResponseError();
		}
	});

	pokemonDetailCache.set(idOrName, { promise, cachedAt: Date.now() });
	return promise;
}

function toImageUrl(raw: RawPokemon): string | null {
	return (
		raw.sprites.other?.["official-artwork"]?.front_default ?? raw.sprites.front_default ?? null
	);
}

export function toPokemonSummary(raw: RawPokemon): PokemonSummary {
	return {
		id: raw.id,
		name: raw.name,
		imageUrl: toImageUrl(raw),
		types: raw.types.map((t) => t.type.name),
	};
}

const STAT_NAME_MAP: Record<string, keyof PokemonStats> = {
	hp: "hp",
	attack: "attack",
	defense: "defense",
	"special-attack": "specialAttack",
	"special-defense": "specialDefense",
	speed: "speed",
};

function toPokemonStats(raw: RawPokemon): PokemonStats {
	const stats: PokemonStats = {
		hp: 0,
		attack: 0,
		defense: 0,
		specialAttack: 0,
		specialDefense: 0,
		speed: 0,
	};

	for (const entry of raw.stats) {
		const key = STAT_NAME_MAP[entry.stat.name];
		if (key) {
			stats[key] = entry.base_stat;
		}
	}

	return stats;
}

export function toPokemonDetail(raw: RawPokemon): PokemonDetail {
	return {
		...toPokemonSummary(raw),
		heightM: raw.height / 10,
		weightKg: raw.weight / 10,
		abilities: raw.abilities.map((a) => a.ability.name),
		stats: toPokemonStats(raw),
	};
}
