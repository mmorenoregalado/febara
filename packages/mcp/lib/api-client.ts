import { config } from "../config";

const REQUEST_TIMEOUT_MS = 5000;

export type ApiResult<T> = { ok: true; data: T } | { ok: false; message: string };

/**
 * Calls an existing REST/OpenAPI endpoint of `packages/api`, forwarding the
 * caller's session cookie so the target `protectedProcedure` resolves the
 * same Better Auth session — no separate auth mechanism for MCP tools.
 */
export async function callApi<T>(
	path: string,
	options: { cookie: string | null; searchParams?: Record<string, string | undefined> },
): Promise<ApiResult<T>> {
	const url = new URL(path, config.saasUrl);
	for (const [key, value] of Object.entries(options.searchParams ?? {})) {
		if (value !== undefined) {
			url.searchParams.set(key, value);
		}
	}

	let response: Response;
	try {
		response = await fetch(url, {
			headers: options.cookie ? { cookie: options.cookie } : {},
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
		});
	} catch {
		return { ok: false, message: "El servicio no está disponible en este momento." };
	}

	if (response.status === 401) {
		return { ok: false, message: "No autenticado. Iniciá sesión en la app e intentá de nuevo." };
	}

	if (response.status === 404) {
		return { ok: false, message: "No se encontró el recurso solicitado." };
	}

	if (!response.ok) {
		return { ok: false, message: "El servicio no está disponible en este momento." };
	}

	try {
		return { ok: true, data: (await response.json()) as T };
	} catch {
		return { ok: false, message: "Respuesta inválida del servicio." };
	}
}

export function cookieFromRequest(req: Request | undefined): string | null {
	return req?.headers.get("cookie") ?? null;
}
