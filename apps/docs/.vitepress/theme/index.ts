import DefaultTheme from "vitepress/theme";

import "./index.css";
import Layout from "./Layout.vue";

export default {
	extends: DefaultTheme,
	Layout,
	enhanceApp() {
		// Register any global components here if needed
	},
};
