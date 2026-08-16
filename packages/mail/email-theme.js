/**
 * Email theme colors derived from the app theme (tooling/tailwind/theme.css).
 *
 * Email clients do not support CSS custom properties, so Tailwind resolves
 * these to hardcoded hex values at build / render time.
 *
 * Shared by:
 *  - apps/mail-preview/tailwind.config.js  (dev preview)
 *  - packages/mail/index.ts                (server-side render)
 */

/** @type {Record<string, string>} */
const colors = {
	// Mirrors the light theme semantic tokens in tooling/tailwind/theme.css.
	// Primary uses olive-950 ink; neutrals use the olive paper scale.
	primary: "#1a1c14",
	"primary-foreground": "#f7faf0",
	foreground: "#1a1c14",
	"highlighted-foreground": "#1a1c14",
	"muted-foreground": "#5c6340",
	background: "#f7faf0",
	"muted-background": "#f7faf0",
	"elevated-background": "#f1f4e8",
	border: "#e4ebc8",
	card: "#ffffff",
	touch: "#52721a",
	"touch-foreground": "#f7faf0",
};

module.exports = { colors };
