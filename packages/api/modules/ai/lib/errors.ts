import { ORPCError } from "@orpc/server";

export class InvalidImageError extends Error {}

export class ImageTooLargeError extends Error {}

export class GeminiUnavailableError extends Error {}

export class GeminiInvalidResponseError extends Error {}

export class McpUnavailableError extends Error {}

export function toORPCError(error: unknown): ORPCError<string, unknown> {
	if (error instanceof InvalidImageError) {
		return new ORPCError("BAD_REQUEST", { message: "Invalid image" });
	}

	if (error instanceof ImageTooLargeError) {
		return new ORPCError("PAYLOAD_TOO_LARGE", { message: "Image is too large" });
	}

	if (
		error instanceof GeminiUnavailableError ||
		error instanceof GeminiInvalidResponseError ||
		error instanceof McpUnavailableError
	) {
		return new ORPCError("BAD_GATEWAY");
	}

	return new ORPCError("INTERNAL_SERVER_ERROR");
}
