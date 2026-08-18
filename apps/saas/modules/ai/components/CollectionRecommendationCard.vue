<script lang="ts" setup>
	import type { ApiRouterOutputs } from "@repo/api/orpc/router";

	type Recommendation = Extract<ApiRouterOutputs["ai"]["collectionInsights"], { hasCollection: true }>["recommendations"][number];

	const props = defineProps<{
		recommendation: Recommendation;
	}>();

	const { t } = useTranslations();
	const toast = useToast();
	const { user } = useSession();

	const { inCollection, add, remove, isAdding, isRemoving } = useCollectionItem(() => props.recommendation.id ?? 0);

	const onAdd = async (e: Event) => {
		e.preventDefault();
		e.stopPropagation();
		if (!props.recommendation.id) return;
		try {
			await add();
			toast.add({ color: "success", title: t("collection.notifications.added") });
		} catch {
			toast.add({ color: "error", title: t("collection.notifications.addError") });
		}
	};

	const onRemove = async (e: Event) => {
		e.preventDefault();
		e.stopPropagation();
		if (!props.recommendation.id) return;
		try {
			await remove();
			toast.add({ color: "success", title: t("collection.notifications.removed") });
		} catch {
			toast.add({ color: "error", title: t("collection.notifications.removeError") });
		}
	};
</script>

<template>
	<NuxtLink
		:to="`/pokemon/${recommendation.pokemonName}`"
		class="group rounded-lg border-default bg-default p-4 border transition-all hover:border-primary/50 hover:shadow-md flex flex-col gap-3 relative"
	>
		<!-- Add to collection button -->
		<UButton
			v-if="user && recommendation.id"
			size="xs"
			:color="inCollection ? 'success' : 'primary'"
			:variant="inCollection ? 'soft' : 'solid'"
			square
			class="right-2 top-2 absolute z-10 rounded-full transition-transform hover:scale-105"
			:loading="isAdding || isRemoving"
			:aria-label="inCollection ? t('collection.card.inCollection') : t('collection.card.add')"
			@click="inCollection ? onRemove($event) : onAdd($event)"
		>
			<UIcon :name="inCollection ? 'i-lucide-check' : 'i-lucide-plus'" class="size-3.5" />
		</UButton>

		<div class="flex items-center gap-4">
			<div class="bg-muted size-16 rounded-lg flex items-center justify-center shrink-0 p-2">
				<img
					v-if="recommendation.imageUrl"
					:src="recommendation.imageUrl"
					:alt="recommendation.pokemonName"
					class="size-full object-contain group-hover:scale-110 transition-transform duration-300"
					loading="lazy"
				/>
				<UIcon v-else name="i-lucide-image-off" class="text-dimmed size-6" />
			</div>
			<div class="flex flex-col pr-8">
				<span class="font-bold capitalize text-lg leading-tight">{{ recommendation.pokemonName }}</span>
				<div class="gap-1 flex flex-wrap mt-1">
					<UBadge
						v-for="type in recommendation.types"
						:key="type"
						color="neutral"
						variant="soft"
						size="xs"
						class="capitalize"
					>
						{{ type }}
					</UBadge>
				</div>
			</div>
		</div>
		<p class="text-muted text-sm border-t border-default pt-3 mt-1">
			{{ recommendation.reason }}
		</p>
	</NuxtLink>
</template>
