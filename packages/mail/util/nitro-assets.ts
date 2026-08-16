type NitroStorage = {
	getItem: (key: string) => Promise<unknown>;
	getKeys: (key?: string) => Promise<string[]>;
};

const storagePromises = new Map<string, Promise<NitroStorage | null>>();

export const normalizeAssetKey = (key: string) =>
	key.replace(/\\/g, "/").replace(/:/g, "/").replace(/^\/+/, "");

export const assetValueToString = (value: unknown) => {
	if (typeof value === "string") {
		return value;
	}

	if (value instanceof Uint8Array) {
		return Buffer.from(value).toString("utf8");
	}

	return null;
};

export const loadNitroAssetStorage = (baseName: string) => {
	const storageId = `assets:${baseName}`;
	const cached = storagePromises.get(storageId);

	if (cached) {
		return cached;
	}

	const promise = import("nitropack/runtime")
		.then((runtime) => {
			if (typeof runtime.useStorage !== "function") {
				return null;
			}

			return runtime.useStorage(storageId) as NitroStorage;
		})
		.catch(() => null);

	storagePromises.set(storageId, promise);

	return promise;
};
