import { collectionChat } from "./procedures/chat-with-collection";
import { collectionInsights } from "./procedures/collection-insights";
import { identifyPokemonCard } from "./procedures/identify-pokemon-card";
import { streamMessage } from "./procedures/stream-message";

export const aiRouter = {
	stream: streamMessage,
	identifyPokemonCard,
	collectionChat,
	collectionInsights,
};
