import { app } from "@repo/api";
import { handle } from "hono/vercel";

export default defineEventHandler(async (event) => {
	const request = toWebRequest(event);

	const response = await handle(app)(request);

	if (response) {
		return response;
	}

	setResponseStatus(event, 404);
	return "Not found";
});
