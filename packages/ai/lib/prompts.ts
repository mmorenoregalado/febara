/**
 * List product names prompt
 *
 * @param {string} topic - The topic to generate product names for.
 * @return {string} The prompt.
 */
export const promptListProductNames = (topic: string): string => {
	return `List me five funny product names that could be used for ${topic}`;
};

/**
 * Prompt instructing the model to identify only the Pokémon species shown on a
 * photographed trading card, ignoring set/rarity/price/condition details.
 *
 * @return {string} The prompt.
 */
export const buildCardIdentificationPrompt = (): string => {
	return (
		"You are given a photo of a physical Pokémon trading card. Identify which Pokémon species " +
		"is depicted on the card. Ignore the card's set, edition, rarity, price, condition, and " +
		"attack/ability text unless it helps identify the Pokémon species. " +
		"If you cannot confidently identify a real Pokémon species in the image (for example, the " +
		"image is not a Pokémon card, is unreadable, or is ambiguous), set identified to false and " +
		"leave pokemonName null. " +
		"When identified, use the Pokémon's standard English species name in lowercase for pokemonName " +
		'(e.g. "pikachu", "charizard").'
	);
};
