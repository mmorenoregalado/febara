export const POKEMON_TYPES = [
	"normal",
	"fire",
	"water",
	"electric",
	"grass",
	"ice",
	"fighting",
	"poison",
	"ground",
	"flying",
	"psychic",
	"bug",
	"rock",
	"ghost",
	"dragon",
	"dark",
	"steel",
	"fairy",
] as const;

function countByType(typesPerEntry: string[][]): Map<string, number> {
	const counts = new Map<string, number>(POKEMON_TYPES.map((type) => [type, 0]));

	for (const types of typesPerEntry) {
		for (const type of types) {
			counts.set(type, (counts.get(type) ?? 0) + 1);
		}
	}

	return counts;
}

export function computeTypeDistribution(
	typesPerEntry: string[][],
): { type: string; count: number }[] {
	const counts = countByType(typesPerEntry);

	return [...counts.entries()]
		.filter(([, count]) => count > 0)
		.sort((a, b) => b[1] - a[1])
		.map(([type, count]) => ({ type, count }));
}

export function computeTypeGaps(
	typesPerEntry: string[][],
): { type: string; status: "absent" | "underrepresented" }[] {
	const counts = countByType(typesPerEntry);
	const presentCounts = [...counts.values()].filter((count) => count > 0);
	const average =
		presentCounts.length > 0
			? presentCounts.reduce((sum, count) => sum + count, 0) / presentCounts.length
			: 0;

	return POKEMON_TYPES.filter((type) => {
		const count = counts.get(type) ?? 0;
		return count === 0 || count < average;
	}).map((type) => ({
		type,
		status: (counts.get(type) ?? 0) === 0 ? ("absent" as const) : ("underrepresented" as const),
	}));
}
