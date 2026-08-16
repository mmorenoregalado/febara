import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./e2e",
	globalSetup: "./e2e/global-setup.ts",
	timeout: 60_000,
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: "html",
	use: {
		baseURL: "http://localhost:3001",
		trace: "on-first-retry",
	},
	projects: [
		{
			name: "chromium",
			use: {
				...devices["Desktop Chrome"],
				...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH && {
					launchOptions: {
						executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
					},
				}),
			},
		},
	],
	webServer: {
		// Dynamic OG rendering rebuilds Nitro after cold route compiles and is outside this suite.
		command: "E2E_DISABLE_OG_IMAGE=true pnpm run dev",
		url: "http://localhost:3001",
		reuseExistingServer: !process.env.CI,
		timeout: 180_000,
	},
});
