import { expect, test } from "@playwright/test";

test.describe("Collection", () => {
	test("unauthenticated user is redirected from the collection page", async ({ page }) => {
		await page.goto("/collection");
		await page.waitForURL(/\/login/, { timeout: 10_000 });
		expect(page.url()).toContain("/login");
	});
});
