import { expect, test } from "@playwright/test";

test.describe("Pokémon card identification", () => {
	test("unauthenticated user is redirected from the card identification page", async ({ page }) => {
		await page.goto("/pokemon/identify");
		await page.waitForURL(/\/login/, { timeout: 10_000 });
		expect(page.url()).toContain("/login");
	});
});
