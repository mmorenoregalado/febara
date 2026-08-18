<script lang="ts" setup>
	import type { ApiRouterOutputs } from "@repo/api/orpc/router";

	type Recommendation = Extract<
		ApiRouterOutputs["ai"]["collectionInsights"],
		{ hasCollection: true }
	>["recommendations"][number];

	const props = defineProps<{
		recommendation: Recommendation;
	}>();

	const { t } = useTranslations();
	const toast = useToast();
	const { user } = useSession();

	const { inCollection, add, remove, isAdding, isRemoving } = useCollectionItem(
		() => props.recommendation.id ?? 0,
	);

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
		class="group rounded-lg border-default bg-default p-4 hover:border-primary/50 hover:shadow-md gap-3 relative flex flex-col border transition-all"
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

		<div class="gap-4 flex items-center">
			<div class="bg-muted size-16 rounded-lg p-2 flex shrink-0 items-center justify-center">
				<img
					v-if="recommendation.imageUrl"
					:src="recommendation.imageUrl"
					:alt="recommendation.pokemonName"
					class="size-full object-contain transition-transform duration-300 group-hover:scale-110"
					loading="lazy"
				/>
				<UIcon v-else name="i-lucide-image-off" class="text-dimmed size-6" />
			</div>
			<div class="pr-8 flex flex-col">
				<span class="font-bold text-lg leading-tight capitalize">{{
					recommendation.pokemonName
				}}</span>
				<div class="gap-1 mt-1 flex flex-wrap">
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
		<p class="text-muted text-sm border-default pt-3 mt-1 border-t">
			{{ recommendation.reason }}
		</p>
	</NuxtLink>
</template>
