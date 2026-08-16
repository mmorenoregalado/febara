<script lang="ts" setup>
	import type { FormSubmitEvent } from "@nuxt/ui";
	import type { ApiRouterOutputs } from "@repo/api/orpc/router";
	import { z } from "zod";

	type AdminUserRow = ApiRouterOutputs["admin"]["users"]["list"]["users"][number];

	const props = defineProps<{
		open: boolean;
		user: AdminUserRow;
	}>();

	const emit = defineEmits<{
		"update:open": [open: boolean];
		saved: [];
	}>();

	const { t } = useTranslations();
	const toast = useToast();
	const authClient = useAuthClient();

	const schema = z.object({
		name: z.string().trim().min(3),
		email: z.string().trim().email(),
		role: z.enum(["user", "admin"]).catch("user"),
		emailVerified: z.boolean(),
	});

	type Schema = z.output<typeof schema>;

	const getInitialState = (user: AdminUserRow): Schema => ({
		name: user.name ?? "",
		email: user.email,
		role: user.role === "admin" ? "admin" : "user",
		emailVerified: user.emailVerified,
	});

	const state = reactive<Schema>(getInitialState(props.user));
	const isSubmitting = ref(false);

	const localOpen = computed({
		get: () => props.open,
		set: (value: boolean) => emit("update:open", value),
	});

	const closeDialog = () => {
		localOpen.value = false;
	};

	const roleOptions = computed<{ label: string; value: Schema["role"] }[]>(() => [
		{
			label: t("admin.users.form.roles.user"),
			value: "user",
		},
		{
			label: t("admin.users.form.roles.admin"),
			value: "admin",
		},
	]);

	const initialState = computed(() => getInitialState(props.user));
	const isDirty = computed(
		() =>
			state.name !== initialState.value.name ||
			state.email !== initialState.value.email ||
			state.role !== initialState.value.role ||
			state.emailVerified !== initialState.value.emailVerified,
	);

	watch(
		() => props.user,
		(user) => {
			Object.assign(state, getInitialState(user));
		},
	);

	watch(localOpen, (open) => {
		if (open) {
			Object.assign(state, getInitialState(props.user));
		}
	});

	const onSubmit = async (event: FormSubmitEvent<Schema>) => {
		isSubmitting.value = true;

		try {
			await authClient.admin.updateUser({
				userId: props.user.id,
				data: {
					name: event.data.name,
					email: event.data.email,
					emailVerified: event.data.emailVerified,
				},
			});

			if (event.data.role !== initialState.value.role) {
				await authClient.admin.setRole({
					userId: props.user.id,
					role: event.data.role,
				});
			}

			toast.add({
				color: "success",
				title: t("admin.users.form.notifications.success"),
			});

			emit("saved");
			localOpen.value = false;
		} catch {
			toast.add({
				color: "error",
				title: t("admin.users.form.notifications.error"),
			});
		} finally {
			isSubmitting.value = false;
		}
	};
</script>

<template>
	<UModal
		v-model:open="localOpen"
		:title="t('admin.users.form.updateTitle')"
		:description="user.email"
	>
		<template #body>
			<UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
				<UFormField name="name" :label="t('admin.users.form.name')" required>
					<UInput v-model="state.name" autocomplete="name" class="w-full" />
				</UFormField>

				<UFormField name="email" :label="t('admin.users.form.email')" required>
					<UInput v-model="state.email" type="email" autocomplete="email" class="w-full" />
				</UFormField>

				<UFormField name="role" :label="t('admin.users.form.role')" required>
					<USelect v-model="state.role" :items="roleOptions" class="w-full" />
				</UFormField>

				<UFormField name="emailVerified">
					<UCheckbox v-model="state.emailVerified" :label="t('admin.users.form.emailVerified')" />
				</UFormField>

				<div class="gap-2 flex justify-end">
					<UButton variant="outline" type="button" @click="closeDialog">
						{{ $t("common.confirmation.cancel") }}
					</UButton>
					<UButton type="submit" :disabled="!isDirty" :loading="isSubmitting">
						{{ t("admin.users.form.save") }}
					</UButton>
				</div>
			</UForm>
		</template>
	</UModal>
</template>
