<script lang="ts" setup>
	defineProps<{
		verified?: boolean;
	}>();

	const { t } = useTranslations();
</script>

<template>
	<UTooltip
		:delay-duration="0"
		:text="
			verified ? t('admin.users.emailVerified.verified') : t('admin.users.emailVerified.waiting')
		"
	>
		<span class="size-3 inline-flex shrink-0 items-center justify-center text-current">
			<UIcon :name="verified ? 'i-lucide-check' : 'i-lucide-clock'" class="size-3" />
		</span>
	</UTooltip>
</template>
