import { db } from "../client";

export async function listCollectionEntriesForUser(userId: string) {
	return await db.collectionEntry.findMany({
		where: { userId },
		orderBy: { createdAt: "desc" },
	});
}

export async function addPokemonToCollection(userId: string, pokemonId: number) {
	return await db.collectionEntry.upsert({
		where: {
			userId_pokemonId: { userId, pokemonId },
		},
		create: { userId, pokemonId },
		update: {},
	});
}

export async function removePokemonFromCollection(userId: string, pokemonId: number) {
	return await db.collectionEntry.deleteMany({
		where: { userId, pokemonId },
	});
}

export async function isPokemonInCollection(userId: string, pokemonId: number) {
	const row = await db.collectionEntry.findUnique({
		where: {
			userId_pokemonId: { userId, pokemonId },
		},
	});
	return Boolean(row);
}

export async function getCollectedPokemonIds(userId: string, pokemonIds: number[]) {
	if (pokemonIds.length === 0) {
		return [];
	}
	const rows = await db.collectionEntry.findMany({
		where: { userId, pokemonId: { in: pokemonIds } },
		select: { pokemonId: true },
	});
	return rows.map((row) => row.pokemonId);
}
