<script setup lang="ts">
	const { t } = useTranslations();

	definePageMeta({
		layout: "app",
	});

	useSeoMeta({
		title: t("app.menu.aiChatbot"),
	});
</script>

<template>
	<UPageHeader
		title="AI Chatbot"
		description="This is an example chatbot built with the OpenAI API"
		class="mb-8 pt-0 max-w-3xl mx-auto"
	/>

	<AiChat />
</template>
