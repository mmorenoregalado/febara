/*
|-------------------------------------------------------------------------------
| Development config - Mail template preview
|-------------------------------------------------------------------------------
|
| Points to the @repo/mail package templates for live preview.
| Run `pnpm dev` to start the preview server at http://localhost:3005
|
*/

/** @type {import('@maizzle/framework').Config} */
export default {
	build: {
		content: ["../../packages/mail/emails/**/*.html"],
	},
	components: {
		root: "../../packages/mail/emails",
	},
};
