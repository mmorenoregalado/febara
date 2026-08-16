export {};

declare global {
	// oxlint-disable-next-line typescript/consistent-type-definitions
	interface ImportMeta {
		readonly server: boolean;
	}
}
