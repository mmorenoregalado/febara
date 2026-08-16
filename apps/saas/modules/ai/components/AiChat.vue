<script setup lang="ts">
	import { eventIteratorToStream } from "@orpc/client";
	import type { UIMessage } from "@repo/ai";
	import DOMPurify from "dompurify";
	import { marked } from "marked";

	type TextPart = Extract<UIMessage["parts"][number], { type: "text" }>;

	const PROMPT_SUGGESTIONS = [
		{
			icon: "i-lucide-code",
			text: "Help me debug a Vue component",
			prompt: "Help me debug a Vue component",
		},
		{
			icon: "i-lucide-mail",
			text: "Write a professional email",
			prompt: "Write a professional email",
		},
		{
			icon: "i-lucide-lightbulb",
			text: "Explain how to optimize database queries",
			prompt: "Explain how to optimize database queries",
		},
		{
			icon: "i-lucide-trending-up",
			text: "Summarize the latest AI trends",
			prompt: "Summarize the latest AI trends",
		},
	] as const;

	const orpcClient = useNuxtApp().$orpcClient;
	const toast = useToast();

	const input = ref("");
	const messages = ref<UIMessage[]>([]);
	const status = ref<"idle" | "streaming" | "submitted">("idle");
	const messagesContainerRef = ref<HTMLDivElement | null>(null);

	const sendMessage = async (text: string) => {
		const userMessage: UIMessage = {
			id: crypto.randomUUID(),
			role: "user",
			parts: [{ type: "text", text }],
		} as UIMessage;

		const updatedMessages = [...messages.value, userMessage];
		messages.value = updatedMessages;
		status.value = "submitted";

		try {
			const eventIterator = await orpcClient.ai.stream(
				{ messages: updatedMessages },
				{ signal: undefined },
			);

			const stream = eventIteratorToStream(eventIterator);
			const reader = stream.getReader();

			status.value = "streaming";

			let assistantMessage: UIMessage = {
				id: crypto.randomUUID(),
				role: "assistant",
				parts: [{ type: "text", text: "" }],
			} as UIMessage;

			messages.value = [...updatedMessages, { ...assistantMessage }];

			while (true) {
				const { done, value } = await reader.read();

				if (done) {
					break;
				}

				if (value && typeof value === "object") {
					const chunk = value as Record<string, unknown>;

					if (chunk.type === "text-delta") {
						const delta = (chunk.delta ?? chunk.textDelta) as string;
						if (delta) {
							const textPart = assistantMessage.parts.find(
								(p: UIMessage["parts"][number]): p is TextPart => p.type === "text",
							);
							if (textPart && "text" in textPart) {
								textPart.text += delta;
							}
						}
					} else if (chunk.type === "finish" && chunk.text) {
						const textPart = assistantMessage.parts.find(
							(p: UIMessage["parts"][number]): p is TextPart => p.type === "text",
						);
						if (textPart && "text" in textPart) {
							textPart.text = chunk.text as string;
						}
					} else if (chunk.role === "assistant" && chunk.parts) {
						assistantMessage = chunk as unknown as UIMessage;
					}

					messages.value = [...updatedMessages, { ...assistantMessage }];
				}
			}

			status.value = "idle";
		} catch (error) {
			status.value = "idle";
			messages.value = updatedMessages.slice(0, -1);
			throw error;
		}
	};

	const handleSuggestionClick = async (prompt: string) => {
		try {
			await sendMessage(prompt);
		} catch {
			toast.add({
				color: "error",
				title: "Failed to send message",
			});
		}
	};

	const handleSubmit = async (e: Event | KeyboardEvent) => {
		e.preventDefault();

		const text = input.value.trim();
		if (!text) {
			return;
		}
		input.value = "";

		try {
			await sendMessage(text);
		} catch {
			toast.add({
				color: "error",
				title: "Failed to send message",
			});
			input.value = text;
		}
	};

	const getMessageText = (message: UIMessage) => {
		return message.parts
			.filter((p: UIMessage["parts"][number]): p is TextPart => p.type === "text" && "text" in p)
			.map((p) => p.text)
			.join("");
	};

	const hasMessageText = (message: UIMessage) => getMessageText(message).trim().length > 0;

	const renderMarkdown = (text: string) =>
		DOMPurify.sanitize(marked.parse(text, { breaks: true }) as string);

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
	<div class="max-w-3xl mx-auto flex h-[calc(100vh-10rem)] flex-col">
		<div ref="messagesContainerRef" class="gap-4 py-8 flex flex-1 flex-col overflow-y-auto">
			<div
				v-if="messages.length === 0"
				class="gap-6 px-4 flex flex-1 flex-col items-center justify-center"
			>
				<div class="gap-4 sm:grid-cols-2 grid w-full grid-cols-1">
					<UButton
						v-for="(suggestion, index) in PROMPT_SUGGESTIONS"
						:key="index"
						type="button"
						variant="secondary"
						:disabled="status === 'streaming'"
						class="group gap-2 rounded-md p-4 h-auto text-center"
						@click="handleSuggestionClick(suggestion.prompt)"
					>
						<UIcon :name="suggestion.icon" class="size-6 text-primary" />
						<span class="text-sm text-highlighted">{{ suggestion.text }}</span>
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
						'max-w-2xl rounded-md px-4 py-2 text-highlighted prose prose-sm dark:prose-invert whitespace-wrap max-w-none',
						message.role === 'user' ? 'bg-primary/10' : 'bg-muted',
					]"
					v-html="renderMarkdown(getMessageText(message))"
				/>
			</div>

			<div v-if="status === 'streaming' || status === 'submitted'" class="flex justify-start">
				<div
					class="max-w-2xl gap-2 rounded-md bg-accented px-4 py-2 text-highlighted flex items-center"
				>
					<UIcon name="i-lucide-ellipsis" class="size-6 animate-pulse" />
				</div>
			</div>
		</div>

		<form @submit.prevent="handleSubmit" class="p-0 relative">
			<textarea
				v-model="input"
				placeholder="Chat with your AI..."
				class="min-h-8 bg-elevated rounded-lg p-6 pr-14 m-0 w-full border align-middle"
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
				class="right-3 bottom-3 absolute bg-touch text-touch-foreground hover:bg-touch/90"
				:disabled="!input.trim() || status === 'streaming'"
			>
				<UIcon name="i-lucide-arrow-up" class="size-4" />
			</UButton>
		</form>
	</div>
</template>
