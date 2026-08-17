import { expect, test } from "@playwright/test";

test.describe("Pokémon explorer", () => {
	test("unauthenticated user is redirected from the Pokémon explorer", async ({ page }) => {
		await page.goto("/");
		await page.waitForURL(/\/login/, { timeout: 10_000 });
		expect(page.url()).toContain("/login");
	});

	test("unauthenticated user is redirected from a Pokémon detail page", async ({ page }) => {
		await page.goto("/pokemon/25");
		await page.waitForURL(/\/login/, { timeout: 10_000 });
		expect(page.url()).toContain("/login");
	});
});
