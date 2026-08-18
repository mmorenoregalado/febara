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

export type CollectionInsightsPromptEntry = {
	name: string;
	types: string[];
	totalBaseStat: number;
};

export type CollectionInsightsPromptGap = {
	type: string;
	status: "absent" | "underrepresented";
};

/**
 * Prompt instructing the model to write narrative insights about a Pokémon collection from
 * numbers that were already computed in code (type distribution, gaps) — the model must never
 * recompute or contradict those numbers, only explain and build on them.
 *
 * @return {string} The prompt.
 */
export const buildCollectionInsightsPrompt = (context: {
	entries: CollectionInsightsPromptEntry[];
	typeDistribution: { type: string; count: number }[];
	gaps: CollectionInsightsPromptGap[];
	language: string;
}): string => {
	const entriesList = context.entries
		.map((e) => `- ${e.name} (types: ${e.types.join("/")}, total base stat: ${e.totalBaseStat})`)
		.join("\n");
	const distributionList = context.typeDistribution
		.map((d) => `- ${d.type}: ${d.count}`)
		.join("\n");
	const gapsList = context.gaps.map((g) => `- ${g.type} (${g.status})`).join("\n");

	return (
		"You are analyzing a trainer's Pokémon collection. The collection contents, the type " +
		"distribution, and the type gaps below were already computed with exact data — treat them " +
		"as ground truth and do not recompute, recount, or contradict any of these numbers.\n\n" +
		`Collection (${context.entries.length} Pokémon):\n${entriesList || "(none)"}\n\n` +
		`Type distribution (count of Pokémon per type already computed):\n${distributionList || "(none)"}\n\n` +
		`Type gaps (types that are absent or underrepresented, already computed):\n${gapsList || "(none)"}\n\n` +
		"Write: a short summary (2-3 sentences) of the collection's overall composition; a list of " +
		"strengths based on the type distribution and stats above; for each type gap listed above, a " +
		"one-sentence reason explaining why it matters (return exactly one entry in gapReasons per " +
		"gap type listed, using the same type name); and a short list of recommended real Pokémon " +
		"species that would help address the gaps, each with a one-sentence reason. Do not describe " +
		"individual Pokémon's lore, trivia, or compare specific Pokémon to each other — focus only on " +
		"the collection's composition and how to improve it.\n\n" +
		`Write the summary, strengths, gapReasons, and recommendation reasons in ${context.language}. ` +
		"The only exception is recommendations.pokemonName, which must always stay in the Pokémon's " +
		'standard English species name in lowercase regardless of the response language (e.g. "pikachu", ' +
		'"charizard"), since it is used to look up the Pokémon and must match exactly.'
	);
};
