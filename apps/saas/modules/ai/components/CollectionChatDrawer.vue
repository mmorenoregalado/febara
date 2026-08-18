<script setup lang="ts">
	import type { UIMessage } from "@repo/ai";
	import DOMPurify from "dompurify";
	import { marked } from "marked";

	type TextPart = Extract<UIMessage["parts"][number], { type: "text" }>;

	const open = defineModel<boolean>("open", { default: false });

	const { t } = useTranslations();

	const SUGGESTIONS = [
		{ icon: "i-lucide-list", key: "count" },
		{ icon: "i-lucide-sparkles", key: "missingType" },
		{ icon: "i-lucide-droplet", key: "searchWater" },
	] as const;

	const { messages, status, errorKey, isConnecting, isStreaming, sendMessage, retryLast } =
		useCollectionChat();

	const input = ref("");
	const messagesContainerRef = ref<HTMLDivElement | null>(null);

	const getMessageText = (message: UIMessage) => {
		return message.parts
			.filter((p: UIMessage["parts"][number]): p is TextPart => p.type === "text" && "text" in p)
			.map((p) => p.text)
			.join("");
	};

	const hasMessageText = (message: UIMessage) => getMessageText(message).trim().length > 0;

	const renderMarkdown = (text: string) =>
		DOMPurify.sanitize(marked.parse(text, { breaks: true }) as string);

	const handleSuggestionClick = (promptKey: (typeof SUGGESTIONS)[number]["key"]) => {
		void sendMessage(t(`ai.collectionChat.suggestions.${promptKey}`));
	};

	const handleSubmit = (e: Event | KeyboardEvent) => {
		e.preventDefault();

		const text = input.value.trim();
		if (!text) {
			return;
		}
		input.value = "";
		void sendMessage(text);
	};

	watch(
		[() => messages.value.length, status],
		() => {
			if (messagesContainerRef.value) {
				messagesContainerRef.value.scrollTop = messagesContainerRef.value.scrollHeight;
			}
		},
		{ flush: "post" },
	);
</script>

<template>
	<UDrawer
		v-model:open="open"
		direction="right"
		:title="t('ai.collectionChat.title')"
		:close="true"
		:ui="{ container: 'sm:w-[420px] md:w-[480px] w-full max-w-[calc(100vw-2rem)] overflow-hidden' }"
	>
		<template #body>
			<div ref="messagesContainerRef" class="gap-4 pr-1 flex h-full flex-col overflow-y-auto">
				<div
					v-if="messages.length === 0"
					class="gap-4 px-1 flex flex-1 flex-col items-center justify-center text-center"
				>
					<UIcon name="i-lucide-sparkles" class="size-8 text-primary" />
					<p class="text-sm text-highlighted">{{ t("ai.collectionChat.welcome") }}</p>
					<div class="gap-2 flex w-full flex-col">
						<UButton
							v-for="suggestion in SUGGESTIONS"
							:key="suggestion.key"
							type="button"
							variant="secondary"
							:disabled="isConnecting || isStreaming"
							class="gap-2 rounded-md p-3 h-auto justify-start text-left"
							@click="handleSuggestionClick(suggestion.key)"
						>
							<UIcon :name="suggestion.icon" class="size-4 text-primary shrink-0" />
							<span class="text-sm text-highlighted">
								{{ t(`ai.collectionChat.suggestions.${suggestion.key}`) }}
							</span>
						</UButton>
					</div>
				</div>

				<div
					v-for="(message, index) in messages"
					:key="index"
					:class="['gap-2 flex flex-col', message.role === 'user' ? 'items-end' : 'items-start']"
				>
					<div
						v-if="hasMessageText(message)"
						:class="[
							'rounded-md px-4 py-2 text-highlighted prose prose-sm dark:prose-invert whitespace-wrap max-w-[85%] max-w-none',
							message.role === 'user' ? 'bg-primary/10' : 'bg-muted',
						]"
						v-html="renderMarkdown(getMessageText(message))"
					/>
				</div>

				<div v-if="isConnecting" class="gap-2 flex justify-start">
					<div
						class="gap-2 rounded-md bg-accented px-4 py-2 text-sm text-highlighted flex max-w-[85%] items-center"
					>
						<UIcon name="i-lucide-loader-circle" class="size-4 animate-spin" />
						{{ t("ai.collectionChat.connecting") }}
					</div>
				</div>

				<div v-else-if="isStreaming" class="flex justify-start">
					<div
						class="gap-2 rounded-md bg-accented px-4 py-2 text-highlighted flex max-w-[85%] items-center"
					>
						<UIcon name="i-lucide-ellipsis" class="size-6 animate-pulse" />
					</div>
				</div>

				<UAlert
					v-if="errorKey"
					color="error"
					variant="soft"
					:description="t(errorKey)"
					:actions="[{ label: t('ai.collectionChat.retry'), onClick: retryLast }]"
				/>
			</div>
		</template>

		<template #footer>
			<form class="p-0 relative" @submit.prevent="handleSubmit">
				<textarea
					v-model="input"
					:placeholder="t('ai.collectionChat.inputPlaceholder')"
					class="min-h-8 bg-elevated rounded-lg p-3 pr-12 m-0 w-full border align-middle"
					@keydown="
						(e: KeyboardEvent) => {
							if (e.key === 'Enter' && (!e.shiftKey || e.metaKey || e.ctrlKey)) {
								e.preventDefault();
								handleSubmit(e);
							}
						}
					"
				/>

				<UButton
					type="submit"
					size="icon"
					variant="primary"
					:aria-label="t('ai.collectionChat.sendAriaLabel')"
					class="right-2 bottom-2 absolute"
					:disabled="!input.trim() || isStreaming || isConnecting"
				>
					<UIcon name="i-lucide-arrow-up" class="size-4" />
				</UButton>
			</form>
		</template>
	</UDrawer>
</template>
