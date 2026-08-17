import { identifyPokemonCard } from "./procedures/identify-pokemon-card";
import { streamMessage } from "./procedures/stream-message";

export const aiRouter = {
	stream: streamMessage,
	identifyPokemonCard,
};
