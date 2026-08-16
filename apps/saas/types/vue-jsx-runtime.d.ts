declare module "vue/jsx-runtime" {
	export * from "vue";
}

declare namespace JSX {
	interface IntrinsicElements {
		[element: string]: Record<string, unknown>;
	}
}
