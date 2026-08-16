/// <reference types="vite/client" />

declare const __MARKETING_URL__: string;

declare module "*.css";

declare module "*.vue" {
	import type { DefineComponent } from "vue";
	const component: DefineComponent;
	export default component;
}
