import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { config as i18nConfig, type Locale } from "@repo/i18n/config";
import { getBaseUrl } from "@repo/utils";

const baseUrl = getBaseUrl();
const appHostname = new URL(baseUrl).hostname;
const mailPackageDir = fileURLToPath(new URL("../../packages/mail", import.meta.url));

export default defineNuxtConfig({
	compatibilityDate: "2026-01-10",

	devtools: {
		enabled: process.env.NODE_ENV !== "production",
	},

	nitro: {
		serverAssets: [
			{
				baseName: "mail",
				dir: mailPackageDir,
				pattern: "emails/**/*.html",
			},
		],
		externals: {
			traceOptions: {
				base: "/",
				// Nitro realpaths traced paths before filtering, so drop stale pnpm links; keep NFT globs (esbuild platform binaries).
				ignore: (path) =>
					!/[*?]/.test(path) && path.includes("node_modules") && !existsSync(resolve("/", path)),
			},
		},
	},

	css: ["~/assets/css/main.css"],

	experimental: {
		typedPages: true,
		cookieStore: false,
	},

	// `/admin` has no real page; client nav to it used to rely on a child `navigateTo` and
	// could no-op. Redirect to the only admin section (users list) on both server and client.
	routeRules: {
		"/admin": { redirect: "/admin/users" },
		"/**": { robots: "noindex, nofollow" },
	},

	runtimeConfig: {
		public: {
			siteUrl: baseUrl,

			// the name of the app
			appName: "PokeDex Manager",

			marketingUrl: process.env.NUXT_PUBLIC_MARKETING_URL as string | undefined,

			// the link to the documentation app (if not defined, the documentation link will not be shown in the app)
			docsUrl: process.env.NUXT_PUBLIC_DOCS_URL as string | undefined,

			// whether the sidebar layout should be used
			useSidebarLayout: true,

			// the redirect path after sign in
			redirectAfterSignIn: "/",

			// the redirect path after logout
			redirectAfterLogout: "/login",
		},
	},

	imports: {
		dirs: ["modules/**/composables/**", "modules/**/lib/**", "modules/**/utils/**"],
		imports: [
			{
				name: "useQuery",
				from: "@tanstack/vue-query",
			},
			{
				name: "useMutation",
				from: "@tanstack/vue-query",
			},
			{
				name: "useQueryClient",
				from: "@tanstack/vue-query",
			},
			{
				name: "z",
				from: "zod",
			},
		],
	},

	components: [
		{ path: "@/modules", pathPrefix: false, extensions: ["vue"] },
		{
			path: "node_modules/@repo/ui/components",
			pathPrefix: false,
			extensions: ["vue"],
		},
	],

	modules: ["@nuxt/ui", "@nuxtjs/i18n", "@nuxt/image", "@nuxtjs/seo", "@vueuse/nuxt"],

	i18n: {
		locales: (Object.keys(i18nConfig.locales) as Locale[]).map((code) => {
			const locale = i18nConfig.locales[code];
			return {
				code,
				language: code,
				files: [`${code}/shared.json`, `${code}/saas.json`],
				name: locale.label,
			};
		}),
		defaultLocale: i18nConfig.defaultLocale,
		strategy: "no_prefix",
		detectBrowserLanguage: {
			useCookie: true,
			cookieKey: i18nConfig.localeCookieName,
			redirectOn: "root",
		},
		baseUrl,
		langDir: "../../../packages/i18n/translations",
		experimental: {
			strictSeo: true,
		},
	},

	// @nuxt/image
	image: {
		domains: [appHostname],
	},

	vite: {
		optimizeDeps: {
			// Reduces on-demand pre-bundling churn in dev when first hitting heavy client modules.
			include: [
				"@tanstack/vue-query",
				"@orpc/tanstack-query",
				"better-auth/client/plugins",
				"@orpc/client",
				"@orpc/client/fetch",
				"zod",
				"better-auth/vue",
				"@better-auth/passkey/client",
				"clsx",
				"tailwind-merge",
				"dompurify",
				"marked",
				"@vue/devtools-core",
				"@vue/devtools-kit",
			],
		},
	},

	// @nuxtjs/robots
	robots: {
		allow: "*",
	},
});
