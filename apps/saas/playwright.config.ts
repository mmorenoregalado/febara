import { defineConfig, devices } from "@playwright/test";

const requestedPort = Number.parseInt(process.env.E2E_PORT ?? "3100", 10);
const e2ePort = Number.isNaN(requestedPort) ? 3100 : requestedPort;
const e2eBaseURL = `http://127.0.0.1:${e2ePort}`;

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: "html",
	use: {
		baseURL: e2eBaseURL,
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
		command: `PORT=${e2ePort} NUXT_PUBLIC_SAAS_URL=${e2eBaseURL} NUXT_OG_IMAGE_SECRET=e2e-og-image-secret pnpm exec nuxt dev --dotenv ../../.env.local --host 127.0.0.1 --port ${e2ePort}`,
		// Use a public auth route: `/` redirects to `/login`, and Playwright follows redirects when probing readiness.
		url: `${e2eBaseURL}/login`,
		reuseExistingServer: !process.env.CI,
		timeout: 180_000,
	},
});
