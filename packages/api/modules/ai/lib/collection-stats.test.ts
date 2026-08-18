import { describe, expect, it } from "vitest";

import { computeTypeDistribution, computeTypeGaps, POKEMON_TYPES } from "./collection-stats";

describe("computeTypeDistribution", () => {
	it("returns an empty array for an empty collection", () => {
		expect(computeTypeDistribution([])).toEqual([]);
	});

	it("counts each type once per entry, including dual-type entries", () => {
		const distribution = computeTypeDistribution([["fire"], ["fire", "flying"], ["water"]]);

		expect(distribution).toHaveLength(3);
		expect(distribution[0]).toEqual({ type: "fire", count: 2 });
		expect(distribution.slice(1)).toEqual(
			expect.arrayContaining([
				{ type: "flying", count: 1 },
				{ type: "water", count: 1 },
			]),
		);
	});

	it("omits types with zero count", () => {
		const distribution = computeTypeDistribution([["electric"]]);

		expect(distribution).toEqual([{ type: "electric", count: 1 }]);
	});

	it("sorts by descending count", () => {
		const distribution = computeTypeDistribution([
			["water"],
			["water"],
			["water"],
			["fire"],
			["fire"],
		]);

		expect(distribution.map((d) => d.type)).toEqual(["water", "fire"]);
	});
});

describe("computeTypeGaps", () => {
	it("flags every type as absent for an empty collection", () => {
		const gaps = computeTypeGaps([]);

		expect(gaps).toHaveLength(POKEMON_TYPES.length);
		expect(gaps.every((g) => g.status === "absent")).toBe(true);
	});

	it("flags every unrepresented type as absent when only one type is present", () => {
		const gaps = computeTypeGaps([["fire"]]);

		const absentTypes = gaps.filter((g) => g.status === "absent").map((g) => g.type);
		expect(absentTypes).toHaveLength(POKEMON_TYPES.length - 1);
		expect(absentTypes).not.toContain("fire");
		expect(gaps.every((g) => g.type !== "fire")).toBe(true);
	});

	it("flags a present-but-below-average type as underrepresented, not absent", () => {
		const typesPerEntry = [
			["water"],
			["water"],
			["water"],
			["water"],
			["water"],
			["water"],
			["water"],
			["water"],
			["water"],
			["fire"],
		];

		const gaps = computeTypeGaps(typesPerEntry);
		const fireGap = gaps.find((g) => g.type === "fire");
		const waterGap = gaps.find((g) => g.type === "water");

		expect(fireGap).toEqual({ type: "fire", status: "underrepresented" });
		expect(waterGap).toBeUndefined();
	});

	it("reports no gaps when every type meets or exceeds the average", () => {
		const typesPerEntry = POKEMON_TYPES.map((type) => [type]);

		expect(computeTypeGaps(typesPerEntry)).toEqual([]);
	});
});
