<script setup lang="ts">
	import type { FormSubmitEvent } from "@nuxt/ui";
	import { z } from "zod";

	const { t } = useTranslations();
	const toast = useToast();
	const { user, reloadSession } = useSession();
	const authClient = useAuthClient();

	const schema = z.object({
		name: z.string().min(3),
	});

	type Schema = z.output<typeof schema>;

	const state = reactive<Schema>({
		name: user.value?.name || "",
	});

	const initialName = computed(() => user.value?.name || "");
	const isSubmitting = ref(false);
	const isDirty = computed(() => state.name !== initialName.value);

	watch(
		() => user.value?.name,
		(newName) => {
			if (newName) {
				state.name = newName;
			}
		},
	);

	const onSubmit = async (event: FormSubmitEvent<Schema>) => {
		isSubmitting.value = true;
		try {
			await authClient.updateUser({
				name: event.data.name,
			});

			toast.add({
				color: "success",
				title: t("settings.account.changeName.notifications.success"),
			});

			await reloadSession();

			state.name = user.value?.name || "";
		} catch (error) {
			toast.add({
				color: "error",
				title: t("settings.account.changeName.notifications.error"),
			});
		} finally {
			isSubmitting.value = false;
		}
	};
</script>

<template>
	<SettingsItem :title="$t('settings.account.changeName.title')">
		<UForm :schema="schema" :state="state" @submit="onSubmit">
			<UFormField name="name">
				<UInput v-model="state.name" autocomplete="name" class="w-full" />
			</UFormField>

			<div class="mt-4 flex justify-end">
				<UButton type="submit" :disabled="!isDirty" :loading="isSubmitting">
					{{ $t("settings.save") }}
				</UButton>
			</div>
		</UForm>
	</SettingsItem>
</template>
