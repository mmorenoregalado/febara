import { expect, test } from "@playwright/test";

test.describe("Auth pages", () => {
	test("login page loads and shows form", async ({ page }) => {
		await page.goto("/login");
		await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
		await expect(page.locator("#email")).toBeVisible();
		await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
	});

	test("login page has link to signup", async ({ page }) => {
		await page.goto("/login");
		await expect(page.getByRole("link", { name: /create an account/i })).toBeVisible();
	});

	test("login page has forgot password link", async ({ page }) => {
		await page.goto("/login");
		await expect(page.getByRole("link", { name: /forgot/i })).toBeVisible();
	});

	test("login password flow can tab to forgot password and submit", async ({ page }) => {
		await page.goto("/login");

		await page.locator("#password").focus();
		await page.keyboard.press("Tab");
		await page.keyboard.press("Tab");
		await expect(page.getByRole("link", { name: /forgot/i })).toBeFocused();

		await page.keyboard.press("Tab");
		await expect(page.getByRole("button", { name: /^sign in$/i })).toBeFocused();
	});

	test("signup page loads and shows form", async ({ page }) => {
		await page.goto("/signup");
		await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
		await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
	});

	test("signup page has link to login", async ({ page }) => {
		await page.goto("/signup");
		await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
	});

	test("forgot password page loads", async ({ page }) => {
		await page.goto("/forgot-password");
		await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
	});

	test("unauthenticated user is redirected from dashboard", async ({ page }) => {
		await page.goto("/");
		await page.waitForURL(/\/login/, { timeout: 10_000 });
		expect(page.url()).toContain("/login");
	});
});
