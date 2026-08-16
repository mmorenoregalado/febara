export const useSidebar = () => {
	const isCollapsedCookie = useCookie<boolean>("sidebar.collapsed", {
		default: () => false,
		sameSite: "lax",
		secure: true,
	});

	const isCollapsed = useState("sidebar.isCollapsed", () => isCollapsedCookie.value);

	// Sync cookie when state changes
	watch(isCollapsed, (newValue) => {
		isCollapsedCookie.value = newValue;
	});

	const toggleCollapsed = () => {
		isCollapsed.value = !isCollapsed.value;
	};

	return {
		isCollapsed,
		toggleCollapsed,
	};
};
