<script setup lang="ts">
	import type { FormSubmitEvent } from "@nuxt/ui";
	import { z } from "zod";

	const { t } = useTranslations();

	const schema = z.object({
		email: z.email(),
	});

	type Schema = z.output<typeof schema>;

	const state = reactive<Schema>({
		email: "",
	});

	const isSubmitSuccessful = ref(false);
	const emailError = ref<string | null>(null);

	const onSubmit = async (_event: FormSubmitEvent<Schema>) => {
		emailError.value = null;
		isSubmitSuccessful.value = false;
		try {
			// TODO: Implement newsletter subscription using your CRM or mailing service integration
			await new Promise((resolve) => setTimeout(resolve, 1000));

			isSubmitSuccessful.value = true;
			state.email = "";
		} catch {
			isSubmitSuccessful.value = false;
			emailError.value = t("newsletter.hints.error.message");
		}
	};
</script>

<template>
	<section class="py-16 lg:py-20 border-default/60 border-t">
		<div class="container">
			<UAlert
				v-if="isSubmitSuccessful"
				color="success"
				icon="i-lucide-check-circle"
				:title="t('newsletter.hints.success.title')"
				:description="t('newsletter.hints.success.message')"
			/>

			<UForm
				v-else
				:schema="schema"
				:state="state"
				class="gap-6 md:grid-cols-[1fr_auto] md:items-end grid grid-cols-1"
				@submit="onSubmit"
				v-slot="{ loading }"
			>
				<div class="max-w-md">
					<h2 class="font-medium text-lg tracking-tight gap-2.5 text-highlighted flex items-center">
						<UIcon name="i-lucide-mail" class="size-5 text-touch" />
						{{ t("newsletter.title") }}
					</h2>
					<p class="mt-1.5 text-sm leading-relaxed text-highlighted/50">
						{{ t("newsletter.subtitle") }}
					</p>
				</div>
				<div class="sm:flex-row sm:items-start gap-2 flex flex-col items-stretch">
					<UFormField name="email">
						<UInput
							v-model="state.email"
							type="email"
							required
							:placeholder="t('newsletter.email')"
							class="md:w-64"
						/>
					</UFormField>
					<UButton
						type="submit"
						class="bg-touch text-touch-foreground hover:bg-touch/90"
						:loading="loading"
					>
						{{ t("newsletter.submit") }}
					</UButton>
				</div>
				<p v-if="emailError" class="text-xs md:col-start-2 text-error">
					{{ emailError }}
				</p>
			</UForm>
		</div>
	</section>
</template>
