<script lang="ts" setup>
	import { useDebounceFn } from "@vueuse/core";

	import AdminOrganizationListActionsCell from "./AdminOrganizationListActionsCell.vue";
	import AdminOrganizationListInfoCell from "./AdminOrganizationListInfoCell.vue";

	const nuxtApp = useNuxtApp();
	const { orpc } = useORPC();
	const { t } = useTranslations();
	const itemsPerPage = ref(10);

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

	const listInput = computed(() => ({
		limit: itemsPerPage.value,
		offset: (currentPage.value - 1) * itemsPerPage.value,
		query: debouncedForApi.value || undefined,
	}));

	const { data, isError, isLoading, error } = useQuery({
		queryKey: computed(() => orpc.admin.organizations.list.queryKey({ input: toValue(listInput) })),
		queryFn: async ({ signal }) => {
			const orpcClient = nuxtApp.$orpcClient;
			return orpcClient.admin.organizations.list(toValue(listInput), { signal });
		},
	});

	const organizations = computed(() => data.value?.organizations ?? []);
	const tableRows = computed(() => organizations.value.map((organization) => ({ organization })));
	const tableColumns = [{ accessorKey: "organization" }, { accessorKey: "actions" }];

	const skeletonRowIndices = computed(() =>
		Array.from({ length: itemsPerPage.value }, (_, i) => i),
	);
</script>

<template>
	<div class="gap-4 flex flex-col">
		<UInput type="search" :placeholder="t('admin.organizations.search')" v-model="searchTerm" />

		<UAlert
			v-if="isError"
			color="error"
			:title="t('admin.organizations.error.title' as never)"
			:description="error?.message"
		/>

		<div class="rounded-md border-default overflow-hidden border">
			<div
				v-if="isLoading"
				class="divide-default divide-y"
				:aria-label="t('admin.organizations.loading')"
			>
				<div
					v-for="i in skeletonRowIndices"
					:key="i"
					class="gap-4 px-3 py-2.5 flex items-center justify-between"
				>
					<div class="gap-3 min-w-0 flex flex-1 items-center">
						<USkeleton class="size-10 rounded-md shrink-0" />
						<div class="min-w-0 space-y-2 flex-1">
							<USkeleton class="h-4 w-48 max-w-[75%]" />
							<USkeleton class="h-3 w-32 max-w-[50%]" />
						</div>
					</div>
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
				<template #organization-cell="{ row }">
					<AdminOrganizationListInfoCell :organization="row.original.organization" />
				</template>

				<template #actions-cell="{ row }">
					<AdminOrganizationListActionsCell :organization="row.original.organization" />
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
