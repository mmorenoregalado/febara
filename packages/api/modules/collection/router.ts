import { addPokemon } from "./procedures/add-pokemon";
import { containsPokemon } from "./procedures/contains-pokemon";
import { listCollection } from "./procedures/list-collection";
import { removePokemon } from "./procedures/remove-pokemon";

export const collectionRouter = {
	list: listCollection,
	add: addPokemon,
	remove: removePokemon,
	contains: containsPokemon,
};
