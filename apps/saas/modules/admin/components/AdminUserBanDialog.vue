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

	const { t: translations } = useTranslations();
	const toast = useToast();
	const authClient = useAuthClient();
	const today = getLocalDateValue(new Date());
	const schema = z.object({
		banReason: z.string().trim().min(1, translations("admin.users.ban.validation.reasonRequired")),
		expirationDate: z
			.string()
			.refine(
				(value) => !value || new Date(`${value}T23:59:59.999`).getTime() > Date.now(),
				translations("admin.users.ban.validation.expirationFuture"),
			),
	});

	type Schema = z.output<typeof schema>;

	const getInitialState = (): Schema => ({
		banReason: "",
		expirationDate: "",
	});

	const state = reactive<Schema>(getInitialState());
	const isSubmitting = ref(false);
	const localOpen = computed({
		get: () => props.open,
		set: (value: boolean) => emit("update:open", value),
	});

	watch(localOpen, (open) => {
		if (open) {
			Object.assign(state, getInitialState());
		}
	});

	function getLocalDateValue(date: Date) {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");

		return `${year}-${month}-${day}`;
	}

	function getBanExpiresIn(expirationDate: string) {
		if (!expirationDate) {
			return undefined;
		}

		const expirationTime = new Date(`${expirationDate}T23:59:59.999`).getTime();

		return Math.max(1, Math.floor((expirationTime - Date.now()) / 1000));
	}

	const onSubmit = async (event: FormSubmitEvent<Schema>) => {
		isSubmitting.value = true;

		try {
			if (!event.data.expirationDate) {
				await authClient.admin.updateUser({
					userId: props.user.id,
					data: {
						banExpires: null,
					},
				});
			}

			await authClient.admin.banUser({
				userId: props.user.id,
				banReason: event.data.banReason,
				banExpiresIn: getBanExpiresIn(event.data.expirationDate),
			});

			toast.add({
				color: "success",
				title: translations("admin.users.ban.notifications.banSuccess"),
			});

			emit("saved");
			localOpen.value = false;
		} catch {
			toast.add({
				color: "error",
				title: translations("admin.users.ban.notifications.banError"),
			});
		} finally {
			isSubmitting.value = false;
		}
	};
</script>

<template>
	<UModal
		v-model:open="localOpen"
		:title="translations('admin.users.ban.dialog.title')"
		:description="
			translations('admin.users.ban.dialog.description', {
				name: user.name ?? user.email,
			})
		"
	>
		<template #body>
			<UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
				<UFormField
					name="banReason"
					:label="translations('admin.users.ban.fields.reason')"
					required
				>
					<UTextarea v-model="state.banReason" class="w-full" />
				</UFormField>

				<UFormField
					name="expirationDate"
					:label="translations('admin.users.ban.fields.expiration')"
				>
					<UInput v-model="state.expirationDate" type="date" :min="today" class="w-full" />
				</UFormField>

				<div class="gap-2 flex justify-end">
					<UButton variant="outline" type="button" @click="localOpen = false">
						{{ translations("common.confirmation.cancel") }}
					</UButton>
					<UButton type="submit" color="primary" variant="solid" :loading="isSubmitting">
						{{
							isSubmitting
								? translations("admin.users.ban.actions.banning")
								: translations("admin.users.ban.actions.confirmBan")
						}}
					</UButton>
				</div>
			</UForm>
		</template>
	</UModal>
</template>
