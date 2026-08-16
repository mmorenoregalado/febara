import { config as i18nConfig, type Locale } from "@repo/i18n/config";
import { getBaseUrl } from "@repo/utils";

const baseUrl = getBaseUrl();

export default defineNuxtConfig({
	compatibilityDate: "2026-01-10",

	devtools: {
		enabled: process.env.NODE_ENV !== "production",
	},

	css: ["~/assets/css/main.css"],

	nitro: {
		externals: {
			inline: ["unhead"],
		},
	},

	experimental: {
		typedPages: true,
	},

	vite: {
		optimizeDeps: {
			include: [
				"zod",
				"clsx",
				"tailwind-merge",
				"@unhead/schema-org/vue",
				"@vue/devtools-core",
				"@vue/devtools-kit",
			],
		},
	},

	runtimeConfig: {
		public: {
			siteUrl: baseUrl,

			// the name of the app
			appName: "PokeDex Manager",

			// the link to the documentation app (if not defined, the documentation link will not be shown in the app)
			docsUrl: process.env.NUXT_PUBLIC_DOCS_URL as string | undefined,

			// the link to the saas app (if not defined, the saas link will not be shown in the app)
			saasUrl: process.env.NUXT_PUBLIC_SAAS_URL as string | undefined,
		},
	},

	imports: {
		dirs: ["modules/**/composables/**", "modules/**/lib/**", "modules/**/utils/**"],
		imports: [
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

	seo: {
		fallbackTitle: false,
	},

	icon: {
		clientBundle: {
			scan: true,
		},
	},

	ogImage: {
		enabled: process.env.E2E_DISABLE_OG_IMAGE !== "true",
	},

	i18n: {
		locales: (Object.keys(i18nConfig.locales) as Locale[]).map((code) => {
			const locale = i18nConfig.locales[code];
			return {
				code,
				language: code,
				files: [`${code}/shared.json`, `${code}/marketing.json`],
				name: locale.label,
			};
		}),
		defaultLocale: i18nConfig.defaultLocale,
		strategy: "prefix_except_default",
		customRoutes: "config",
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

	// @nuxtjs/robots
	robots: {
		allow: "*",
	},
});
