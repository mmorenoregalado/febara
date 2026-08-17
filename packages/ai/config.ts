export const config = {
	gemini: {
		apiKey: process.env.GEMINI_API_KEY as string,
		model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash-lite",
	},
} as const;
