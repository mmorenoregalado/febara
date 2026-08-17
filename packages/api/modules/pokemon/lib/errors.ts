import { ORPCError } from "@orpc/server";

export class PokeApiNotFoundError extends Error {}

export class PokeApiTimeoutError extends Error {}

export class PokeApiUnavailableError extends Error {
	constructor(public status?: number) {
		super(`PokéAPI responded with status ${status}`);
	}
}

export class PokeApiInvalidResponseError extends Error {}

export function toORPCError(error: unknown): ORPCError<string, unknown> {
	if (error instanceof PokeApiNotFoundError) {
		return new ORPCError("NOT_FOUND");
	}

	if (error instanceof PokeApiTimeoutError) {
		return new ORPCError("GATEWAY_TIMEOUT");
	}

	if (error instanceof PokeApiUnavailableError || error instanceof PokeApiInvalidResponseError) {
		return new ORPCError("BAD_GATEWAY");
	}

	return new ORPCError("INTERNAL_SERVER_ERROR");
}
