export const sessionQueryKey = ["user", "session"] as const;

export const useSessionQuery = () => {
	const headers = useRequestHeaders();
	const authClient = useAuthClient();

	return useQuery({
		queryKey: sessionQueryKey,
		queryFn: async () => {
			const data = await authClient.getSession({
				query: {
					disableCookieCache: true,
				},
				fetchOptions: {
					headers,
				},
			});

			return data;
		},
		staleTime: Number.POSITIVE_INFINITY,
		refetchOnWindowFocus: false,
		retry: false,
	});
};

export const userAccountQueryKey = ["user", "accounts"] as const;
export const useUserAccountsQuery = () => {
	const headers = useRequestHeaders();
	const authClient = useAuthClient();

	return useQuery({
		queryKey: userAccountQueryKey,
		queryFn: async () => {
			const data = await authClient.listAccounts({
				fetchOptions: {
					headers,
				},
			});

			return data;
		},
	});
};

export const userPasskeyQueryKey = ["user", "passkeys"] as const;
export const useUserPasskeysQuery = () => {
	const headers = useRequestHeaders();
	const authClient = useAuthClient();

	return useQuery({
		queryKey: userPasskeyQueryKey,
		queryFn: async () => {
			const data = await authClient.passkey.listUserPasskeys({
				fetchOptions: {
					headers,
				},
			});

			return data;
		},
	});
};
