const { colors } = require("../../packages/mail/email-theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
	presets: [require("tailwindcss-preset-email")],
	content: ["../../packages/mail/emails/**/*.html"],
	theme: {
		extend: {
			colors,
		},
	},
};
