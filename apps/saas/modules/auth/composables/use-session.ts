export const useSession = () => {
	const queryClient = useQueryClient();
	const authClient = useAuthClient();

	const {
		data: sessionData,
		suspense: prefetchSession,
		refetch: reloadSession,
	} = useSessionQuery();

	const session = computed(() => sessionData.value?.session ?? null);
	const user = computed(() => sessionData.value?.user ?? null);

	const logout = async () => {
		await authClient.signOut();
		queryClient.clear();
		await navigateTo("/");
	};

	return {
		session,
		user,
		logout,
		reloadSession,
		prefetchSession,
	};
};
