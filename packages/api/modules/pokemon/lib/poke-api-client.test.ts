import { describe, expect, it } from "vitest";

import { toPokemonDetail } from "./poke-api-client";

const rawPikachu = {
	id: 25,
	name: "pikachu",
	height: 4,
	weight: 60,
	types: [{ type: { name: "electric" } }],
	abilities: [{ ability: { name: "static" } }, { ability: { name: "lightning-rod" } }],
	stats: [
		{ base_stat: 35, stat: { name: "hp" } },
		{ base_stat: 55, stat: { name: "attack" } },
		{ base_stat: 40, stat: { name: "defense" } },
		{ base_stat: 50, stat: { name: "special-attack" } },
		{ base_stat: 50, stat: { name: "special-defense" } },
		{ base_stat: 90, stat: { name: "speed" } },
	],
	sprites: {
		front_default: "https://example.com/pikachu-front.png",
		other: {
			"official-artwork": { front_default: "https://example.com/pikachu-artwork.png" },
		},
	},
} as Parameters<typeof toPokemonDetail>[0];

describe("toPokemonDetail", () => {
	it("maps abilities to a flat list of names", () => {
		expect(toPokemonDetail(rawPikachu).abilities).toEqual(["static", "lightning-rod"]);
	});

	it("maps stats from PokéAPI's stat-name/base_stat pairs to the frontend shape", () => {
		expect(toPokemonDetail(rawPikachu).stats).toEqual({
			hp: 35,
			attack: 55,
			defense: 40,
			specialAttack: 50,
			specialDefense: 50,
			speed: 90,
		});
	});

	it("defaults missing stats to 0 instead of throwing", () => {
		const partial = { ...rawPikachu, stats: [{ base_stat: 35, stat: { name: "hp" } }] };

		expect(toPokemonDetail(partial).stats).toEqual({
			hp: 35,
			attack: 0,
			defense: 0,
			specialAttack: 0,
			specialDefense: 0,
			speed: 0,
		});
	});
});
