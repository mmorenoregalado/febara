/**
 * Route query param backed by vue-router. Prefer this over `useRouteQuery` from
 * `@vueuse/router` during SSR in Nuxt 4 — the VueUse helper registers the router
 * in a WeakMap and throws when `useRouter()` is undefined on the server.
 */
type RouteQueryParamOptions = {
	/**
	 * Router navigation mode when writing query params.
	 * @default 'replace'
	 */
	mode?: "replace" | "push";
};

const pendingQueryUpdates = new Map<string, string | undefined>();
let pendingMode: RouteQueryParamOptions["mode"] = "replace";
let flushScheduled = false;

const scheduleQueryFlush = () => {
	if (flushScheduled || !import.meta.client) {
		return;
	}

	flushScheduled = true;

	void nextTick(() => {
		flushScheduled = false;
		flushPendingQueryUpdates();
	});
};

const flushPendingQueryUpdates = () => {
	if (pendingQueryUpdates.size === 0) {
		return;
	}

	const route = useRoute();
	const router = useRouter();

	if (!router) {
		pendingQueryUpdates.clear();
		return;
	}

	const query = { ...route.query };

	for (const [paramName, value] of pendingQueryUpdates) {
		if (value === undefined) {
			delete query[paramName];
		} else {
			query[paramName] = value;
		}
	}

	pendingQueryUpdates.clear();

	const navigation = {
		path: route.path,
		query,
		hash: route.hash,
	};

	void router[pendingMode ?? "replace"](navigation);
	pendingMode = "replace";
};

export const useRouteQueryParam = (
	name: string,
	defaultValue = "",
	options: RouteQueryParamOptions = {},
) =>
	computed({
		get() {
			const value = useRoute().query[name];

			if (value == null || value === "") {
				return defaultValue;
			}

			return Array.isArray(value) ? (value[0] ?? defaultValue) : String(value);
		},
		set(value: string) {
			if (!import.meta.client) {
				return;
			}

			const normalized = value === defaultValue || value === "" ? undefined : value;

			pendingQueryUpdates.set(name, normalized);
			pendingMode = options.mode ?? "replace";
			scheduleQueryFlush();
		},
	});
