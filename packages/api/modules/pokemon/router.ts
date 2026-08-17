import { getPokemon } from "./procedures/get-pokemon";
import { listPokemon } from "./procedures/list-pokemon";

export const pokemonRouter = {
	list: listPokemon,
	get: getPokemon,
};
