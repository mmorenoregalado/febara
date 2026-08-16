import { expect, test } from "@playwright/test";

test.describe("Marketing pages", () => {
	test("home page loads and shows hero", async ({ page }) => {
		await page.goto("/", { waitUntil: "domcontentloaded", timeout: 60_000 });
		await expect(
			page.getByRole("heading", {
				name: /build your pok.dex platform without rebuilding the foundations/i,
			}),
		).toBeVisible({ timeout: 15_000 });
		await expect(page.getByText("maya@oaklabs.com")).toBeVisible();
	});

	test("home page has FAQ section", async ({ page }) => {
		await page.goto("/", { waitUntil: "domcontentloaded", timeout: 60_000 });
		await expect(page.getByText(/frequently asked questions/i).first()).toBeVisible({
			timeout: 15_000,
		});
	});

	test("contact page loads and shows form", async ({ page }) => {
		await page.goto("/contact", { waitUntil: "domcontentloaded", timeout: 60_000 });
		await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
	});

	test("changelog page loads", async ({ page }) => {
		await page.goto("/changelog", { waitUntil: "domcontentloaded", timeout: 60_000 });
		await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
	});

	test("navigation is present", async ({ page }) => {
		await page.goto("/contact", { waitUntil: "domcontentloaded", timeout: 60_000 });
		await expect(page.locator('[data-test="navigation"]')).toBeVisible();
	});
});
