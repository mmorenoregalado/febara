import { getSignedUrl } from "@repo/storage";

export default defineEventHandler(async (event) => {
	const pathParam = getRouterParams(event).path;

	if (!pathParam) {
		setResponseStatus(event, 400);
		return "Invalid path";
	}

	const pathParts = pathParam.split("/");
	const [bucket, ...filePathParts] = pathParts;
	const filePath = filePathParts.join("/");

	if (!(bucket && filePath)) {
		setResponseStatus(event, 400);
		return "Invalid path";
	}

	if (bucket === "avatars") {
		const signedUrl = await getSignedUrl(filePath, {
			bucket,
			expiresIn: 60 * 60,
		});

		const response = await fetch(signedUrl);

		if (!response.ok || !response.body) {
			setResponseStatus(event, response.status || 502);
			return "Failed to fetch image";
		}

		setResponseHeader(event, "Content-Type", response.headers.get("Content-Type") ?? "image/png");
		setResponseHeader(event, "Cache-Control", "max-age=3600");

		return response.body;
	}

	setResponseStatus(event, 404);
	return "Not found";
});
