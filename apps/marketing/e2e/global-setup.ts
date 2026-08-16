import { chromium, type FullConfig, type Page } from "@playwright/test";

const ROUTES_TO_WARM = ["/", "/contact", "/changelog"];
const WARMUP_ATTEMPTS = 3;
const WARMUP_TIMEOUT = 15_000;

async function warmRoute(page: Page, routeUrl: string) {
	for (let attemptNumber = 0; attemptNumber < WARMUP_ATTEMPTS; attemptNumber += 1) {
		try {
			await page.goto(routeUrl, {
				waitUntil: "domcontentloaded",
				timeout: WARMUP_TIMEOUT,
			});
		} catch {
			// A cold route compile can reload Nitro and abort this navigation.
		}
	}
}

export default async function globalSetup(config: FullConfig) {
	const chromiumProject = config.projects.find((project) => project.name === "chromium");
	const baseUrl = chromiumProject?.use.baseURL;

	if (typeof baseUrl !== "string") {
		throw new Error("The marketing Playwright project requires a base URL.");
	}

	const browser = await chromium.launch();
	const page = await browser.newPage();

	try {
		for (const routePath of ROUTES_TO_WARM) {
			await warmRoute(page, new URL(routePath, baseUrl).toString());
		}
	} finally {
		await browser.close();
	}
}
