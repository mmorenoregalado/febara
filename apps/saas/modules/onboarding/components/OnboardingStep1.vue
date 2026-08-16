<script setup lang="ts">
	import type { FormSubmitEvent } from "@nuxt/ui";
	import { z } from "zod";

	const emit = defineEmits<{
		complete: [];
	}>();

	const { user } = useSession();
	const authClient = useAuthClient();
	const { t } = useTranslations();
	const toast = useToast();

	const schema = z.object({
		name: z.string().min(1),
	});

	type Schema = z.output<typeof schema>;

	const state = reactive<Schema>({
		name: user.value?.name || "",
	});

	watch(
		() => user.value?.name,
		(newName) => {
			if (newName) {
				state.name = newName;
			}
		},
	);

	const serverError = ref<null | string>(null);
	const isSubmitting = ref(false);

	const onSubmit = async (event: FormSubmitEvent<Schema>) => {
		serverError.value = null;
		isSubmitting.value = true;

		try {
			await authClient.updateUser({
				name: event.data.name,
			});

			emit("complete");
		} catch (e) {
			serverError.value = t("onboarding.notifications.accountSetupFailed");
		} finally {
			isSubmitting.value = false;
		}
	};

	const onAvatarUploadError = () => {
		toast.add({
			color: "error",
			title: t("settings.notifications.avatarNotUpdated"),
		});
	};
</script>

<template>
	<div>
		<UForm
			:schema="schema"
			:state="state"
			@submit="onSubmit"
			class="gap-8 flex flex-col items-stretch"
		>
			<UFormField name="name" :label="$t('onboarding.account.name')" required>
				<UInput v-model="state.name" autocomplete="name" />
			</UFormField>

			<UFormField
				name="avatar"
				:label="$t('onboarding.account.avatar')"
				:description="$t('onboarding.account.avatarDescription')"
			>
				<UserAvatarUpload @error="onAvatarUploadError()" />
			</UFormField>

			<UButton type="submit" :loading="isSubmitting">
				{{ $t("onboarding.continue") }}
				<UIcon name="i-lucide-arrow-right" class="ml-2 size-4" />
			</UButton>
		</UForm>
	</div>
</template>
