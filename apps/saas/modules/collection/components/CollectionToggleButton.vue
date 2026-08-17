<script lang="ts" setup>
	const props = defineProps<{
		pokemonId: number;
	}>();

	const { t } = useTranslations();
	const toast = useToast();
	const { user } = useSession();

	const { inCollection, isLoading, add, remove, isAdding, isRemoving } = useCollectionItem(
		() => props.pokemonId,
	);

	const onAdd = async () => {
		try {
			await add();
			toast.add({ color: "success", title: t("collection.notifications.added") });
		} catch {
			toast.add({ color: "error", title: t("collection.notifications.addError") });
		}
	};

	const onRemove = async () => {
		try {
			await remove();
			toast.add({ color: "success", title: t("collection.notifications.removed") });
		} catch {
			toast.add({ color: "error", title: t("collection.notifications.removeError") });
		}
	};
</script>

<template>
	<div v-if="user" class="gap-2 flex flex-wrap">
		<template v-if="!isLoading">
			<UButton
				v-if="!inCollection"
				icon="i-lucide-plus"
				:loading="isAdding"
				:label="t('collection.detail.add')"
				@click="onAdd"
			/>
			<template v-else>
				<UButton
					color="success"
					variant="soft"
					icon="i-lucide-check"
					disabled
					:label="t('collection.detail.inCollection')"
				/>
				<UButton
					color="error"
					variant="soft"
					icon="i-lucide-trash-2"
					:loading="isRemoving"
					:label="t('collection.detail.remove')"
					@click="onRemove"
				/>
			</template>
		</template>
		<USkeleton v-else class="h-9 w-40" />
	</div>
</template>
