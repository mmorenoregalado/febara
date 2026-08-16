export const isStoragePath = (path?: string | null): path is string => {
	if (!path) {
		return false;
	}

	return !path.startsWith("http://") && !path.startsWith("https://");
};
