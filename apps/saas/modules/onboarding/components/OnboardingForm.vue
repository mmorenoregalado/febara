<script setup lang="ts">
	import { getSafeRedirectPath } from "~/modules/shared/utils/redirect";

	const { t } = useTranslations();
	const route = useRoute();
	const queryClient = useQueryClient();
	const authClient = useAuthClient();

	const stepSearchParam = route.query.step;
	const redirectToParam = Array.isArray(route.query.redirectTo)
		? route.query.redirectTo[0]
		: route.query.redirectTo;

	const onboardingStep = stepSearchParam ? Number.parseInt(String(stepSearchParam), 10) : 1;

	const setStep = (step: number) => {
		navigateTo(
			{
				query: {
					step,
				},
			},
			{
				replace: true,
			},
		);
	};

	const onCompleted = async () => {
		await authClient.updateUser({
			onboardingComplete: true,
		});

		queryClient.clear();

		navigateTo(getSafeRedirectPath(redirectToParam), {
			replace: true,
		});
	};

	const steps = [
		{
			component: resolveComponent("OnboardingStep1"),
			onComplete: () => onCompleted(),
		},
	];

	const currentStep = computed(() => steps[onboardingStep - 1]);

	const stepComponent = computed(() => currentStep.value?.component);
</script>

<template>
	<div>
		<h1 class="font-bold text-xl md:text-2xl">
			{{ $t("onboarding.title") }}
		</h1>
		<p class="mt-2 mb-6 text-muted">
			{{ $t("onboarding.message") }}
		</p>

		<div v-if="steps.length > 1" class="mb-6 gap-3 flex items-center">
			<UProgress :model-value="(onboardingStep / steps.length) * 100" class="h-2" />
			<span class="text-muted text-xs shrink-0">
				{{
					$t("onboarding.step", {
						step: onboardingStep,
						total: steps.length,
					})
				}}
			</span>
		</div>

		<component v-if="currentStep" :is="stepComponent" @complete="currentStep.onComplete" />
	</div>
</template>
