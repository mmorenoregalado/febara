<script setup lang="ts">
	import type { FormSubmitEvent } from "@nuxt/ui";
	import { z } from "zod";

	const { t } = useTranslations();

	const schema = z.object({
		name: z.string().min(3),
		email: z.email(),
		message: z.string().min(10),
	});

	type Schema = z.output<typeof schema>;

	const state = reactive<Schema>({
		name: "",
		email: "",
		message: "",
	});

	const isSubmitSuccessful = ref(false);
	const rootError = ref<string | null>(null);

	const onSubmit = async (event: FormSubmitEvent<Schema>) => {
		rootError.value = null;
		isSubmitSuccessful.value = false;

		try {
			// TODO: Implement contact form submission using your CRM or mailing service integration
			await new Promise((resolve) => setTimeout(resolve, 1000));

			isSubmitSuccessful.value = true;
		} catch {
			rootError.value = t("contact.form.notifications.error");
		}
	};
</script>

<template>
	<div>
		<UAlert
			v-if="isSubmitSuccessful"
			color="success"
			icon="i-lucide-mail-check"
			:title="$t('contact.form.notifications.success')"
		/>

		<UForm
			v-else
			:schema="schema"
			:state="state"
			@submit="onSubmit"
			class="gap-4 flex flex-col items-stretch"
			v-slot="{ loading }"
		>
			<UAlert v-if="rootError" color="error" icon="i-lucide-mail" :title="rootError" />

			<UFormField name="name" :label="$t('contact.form.name')">
				<UInput v-model="state.name" class="w-full" />
			</UFormField>

			<UFormField name="email" :label="$t('contact.form.email')">
				<UInput v-model="state.email" type="email" class="w-full" />
			</UFormField>

			<UFormField name="message" :label="$t('contact.form.message')">
				<UTextarea v-model="state.message" class="w-full" />
			</UFormField>

			<UButton type="submit" class="w-full" :loading="loading">
				{{ $t("contact.form.submit") }}
			</UButton>
		</UForm>
	</div>
</template>
