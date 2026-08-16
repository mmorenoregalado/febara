export const useDashboardState = () => {
	const sidebarExpanded = useState("dashboardState.sidebarExpanded", () => false);

	return {
		sidebarExpanded,
	};
};
