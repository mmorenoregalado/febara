<script lang="ts" setup>
	import { useDebounceFn, useNow } from "@vueuse/core";

	import AdminUserListActionsCell from "./AdminUserListActionsCell.vue";
	import AdminUserListInfoCell from "./AdminUserListInfoCell.vue";

	const BAN_STATUS_REFRESH_INTERVAL = 30_000;
	const nuxtApp = useNuxtApp();
	const { orpc } = useORPC();
	const { t } = useTranslations();
	const itemsPerPage = ref(10);
	const banStatusTime = useNow({ interval: BAN_STATUS_REFRESH_INTERVAL });

	const qQuery = useRouteQueryParam("q");
	const pageQuery = useRouteQueryParam("page", "1");

	const searchTerm = ref(qQuery.value);
	const debouncedForApi = ref(qQuery.value.trim());

	const readPageFromRoute = () => {
		const p = Number.parseInt(pageQuery.value, 10);
		if (!Number.isFinite(p) || p < 1) {
			return 1;
		}
		return p;
	};

	const currentPage = ref(readPageFromRoute());
	let isSyncingPageFromRoute = false;

	watch(
		pageQuery,
		() => {
			const next = readPageFromRoute();
			if (currentPage.value === next) {
				return;
			}
			isSyncingPageFromRoute = true;
			currentPage.value = next;
			void nextTick(() => {
				isSyncingPageFromRoute = false;
			});
		},
		{ immediate: true },
	);

	watch(currentPage, (p) => {
		if (isSyncingPageFromRoute) {
			return;
		}
		if (p === readPageFromRoute()) {
			return;
		}
		const q = debouncedForApi.value;
		if (!qQuery.value && q) {
			qQuery.value = q;
		}
		pageQuery.value = p > 1 ? String(p) : "1";
	});

	const runDebounced = useDebounceFn((v: string) => {
		debouncedForApi.value = v.trim();
	}, 500);

	watch(searchTerm, (v) => {
		void runDebounced(v);
	});

	watch(debouncedForApi, (q) => {
		if (q === qQuery.value.trim()) {
			return;
		}
		isSyncingPageFromRoute = true;
		currentPage.value = 1;
		pageQuery.value = "1";
		qQuery.value = q;
		void nextTick(() => {
			isSyncingPageFromRoute = false;
		});
	});

	watch(qQuery, (q) => {
		if (q !== searchTerm.value) {
			searchTerm.value = q;
		}
		debouncedForApi.value = q.trim();
	});

	// For each request, read the latest list args (route drives page, debounced field drives q).
	const listInput = computed(() => ({
		limit: itemsPerPage.value,
		offset: (currentPage.value - 1) * itemsPerPage.value,
		query: debouncedForApi.value || undefined,
	}));

	const { data, isError, isLoading, error } = useQuery({
		queryKey: computed(() => orpc.admin.users.list.queryKey({ input: toValue(listInput) })),
		queryFn: async ({ signal }) => {
			const orpcClient = nuxtApp.$orpcClient;
			return orpcClient.admin.users.list(toValue(listInput), { signal });
		},
	});

	const users = computed(() => data.value?.users ?? []);

	/** Shape rows so UTable column `accessorKey`s match (same pattern as OrganizationMembersList). */
	const tableRows = computed(() =>
		users.value.map((user) => ({
			user,
			isActivelyBanned:
				user.banned === true &&
				(!user.banExpires || new Date(user.banExpires).getTime() > banStatusTime.value.getTime()),
		})),
	);

	const tableColumns = [{ accessorKey: "user" }, { accessorKey: "actions" }];

	const skeletonRowIndices = computed(() =>
		Array.from({ length: itemsPerPage.value }, (_, i) => i),
	);
</script>

<template>
	<div class="gap-4 flex flex-col">
		<UInput type="search" :placeholder="t('admin.users.search')" v-model="searchTerm" />

		<UAlert
			v-if="isError"
			color="error"
			:title="t('admin.users.error.title')"
			:description="error?.message"
		/>

		<div class="rounded-md border-default overflow-hidden border">
			<div v-if="isLoading" class="divide-default divide-y" :aria-label="t('admin.users.loading')">
				<div
					v-for="i in skeletonRowIndices"
					:key="i"
					class="gap-4 px-3 py-2.5 flex items-center justify-between"
				>
					<div class="min-w-0 space-y-2 flex-1">
						<USkeleton class="h-4 w-48 max-w-[75%]" />
						<USkeleton class="h-3 w-32 max-w-[50%]" />
					</div>
					<USkeleton class="h-8 w-20 shrink-0" />
				</div>
			</div>

			<UTable
				v-else
				:data="tableRows"
				:columns="tableColumns"
				:global-filter-options="{ enableGlobalFilter: false }"
				class="w-full"
				:ui="{
					thead: 'hidden',
					td: 'py-2',
				}"
			>
				<template #user-cell="{ row }">
					<AdminUserListInfoCell
						:user="row.original.user"
						:is-actively-banned="row.original.isActivelyBanned"
					/>
				</template>

				<template #actions-cell="{ row }">
					<AdminUserListActionsCell
						:user="row.original.user"
						:is-actively-banned="row.original.isActivelyBanned"
					/>
				</template>

				<template #empty>
					<div class="h-24 text-center">No results.</div>
				</template>
			</UTable>
		</div>

		<div class="flex justify-center">
			<UPagination
				v-model:page="currentPage"
				:total="data?.total ?? 0"
				:items-per-page="itemsPerPage"
				:sibling-count="1"
				:show-edges="true"
			/>
		</div>
	</div>
</template>
