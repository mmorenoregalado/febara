import { describe, expect, it } from "vitest";

import { ImageTooLargeError, InvalidImageError } from "./errors";
import { decodeAndValidateImage } from "./image-validation";

describe("decodeAndValidateImage", () => {
	it("decodes a valid base64 string into a Buffer", () => {
		const base64 = Buffer.from("fake-image-bytes").toString("base64");

		const buffer = decodeAndValidateImage(base64);

		expect(buffer.toString()).toBe("fake-image-bytes");
	});

	it("rejects an empty string", () => {
		expect(() => decodeAndValidateImage("")).toThrow(InvalidImageError);
	});

	it("rejects malformed base64", () => {
		expect(() => decodeAndValidateImage("not base64!!!")).toThrow(InvalidImageError);
	});

	it("rejects an image larger than the 10MB limit", () => {
		const oversized = Buffer.alloc(10 * 1024 * 1024 + 1, 1).toString("base64");

		expect(() => decodeAndValidateImage(oversized)).toThrow(ImageTooLargeError);
	});
});
