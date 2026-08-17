import { ImageTooLargeError, InvalidImageError } from "./errors";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const BASE64_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/;

/**
 * `Buffer.from(str, "base64")` silently drops invalid characters instead of
 * throwing, so malformed input is rejected explicitly before decoding.
 */
export function decodeAndValidateImage(imageBase64: string): Buffer {
	if (
		imageBase64.length === 0 ||
		imageBase64.length % 4 !== 0 ||
		!BASE64_PATTERN.test(imageBase64)
	) {
		throw new InvalidImageError();
	}

	const buffer = Buffer.from(imageBase64, "base64");

	if (buffer.length === 0) {
		throw new InvalidImageError();
	}

	if (buffer.length > MAX_IMAGE_BYTES) {
		throw new ImageTooLargeError();
	}

	return buffer;
}
