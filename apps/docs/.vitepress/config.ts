import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitepress";

export default defineConfig({
	vite: {
		plugins: [tailwindcss()],
		define: {
			__MARKETING_URL__: JSON.stringify(process.env.NUXT_PUBLIC_MARKETING_URL || ""),
		},
	},
	title: "Documentation",
	description: "PokeDex Manager Documentation",

	// Base URL for deployment
	base: "/",

	// Custom CSS theme
	head: [
		["link", { rel: "icon", type: "image/png", href: "/icon.png" }],
		["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
		["link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" }],
		[
			"link",
			{
				href: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
				rel: "stylesheet",
			},
		],
	],

	// Theme configuration
	themeConfig: {
		// Navigation
		nav: [{ text: "Home", link: "/" }],

		// Footer
		footer: {
			message: "Released under the MIT License.",
			copyright: "Copyright © 2026 - PokeDex Manager",
		},

		// Search
		search: {
			provider: "local",
		},
	},
});
