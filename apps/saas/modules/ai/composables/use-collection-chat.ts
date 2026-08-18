import { eventIteratorToStream, ORPCError } from "@orpc/client";
import type { UIMessage } from "@repo/ai";

type TextPart = Extract<UIMessage["parts"][number], { type: "text" }>;
type ChatStatus = "idle" | "submitted" | "streaming" | "error";

function errorKeyFromORPCError(error: unknown): string {
	if (error instanceof ORPCError) {
		if (error.code === "UNAUTHORIZED") {
			return "ai.collectionChat.errors.sessionExpired";
		}
		if (error.code === "BAD_GATEWAY" || error.code === "GATEWAY_TIMEOUT") {
			return "ai.collectionChat.errors.unavailable";
		}
	}
	return "ai.collectionChat.errors.generic";
}

export const useCollectionChat = () => {
	const orpcClient = useNuxtApp().$orpcClient;

	const messages = ref<UIMessage[]>([]);
	const status = ref<ChatStatus>("idle");
	const errorKey = ref<string | null>(null);

	const sendMessage = async (text: string) => {
		const userMessage: UIMessage = {
			id: crypto.randomUUID(),
			role: "user",
			parts: [{ type: "text", text }],
		} as UIMessage;

		const updatedMessages = [...messages.value, userMessage];
		messages.value = updatedMessages;
		status.value = "submitted";
		errorKey.value = null;

		try {
			const eventIterator = await orpcClient.ai.collectionChat(
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
					} else if (chunk.type === "error") {
						status.value = "error";
						errorKey.value = "ai.collectionChat.errors.generic";
					} else if (chunk.role === "assistant" && chunk.parts) {
						assistantMessage = chunk as unknown as UIMessage;
					}

					messages.value = [...updatedMessages, { ...assistantMessage }];
				}
			}

			if (status.value !== "error") {
				status.value = "idle";
			}
		} catch (error) {
			status.value = "error";
			errorKey.value = errorKeyFromORPCError(error);
			messages.value = updatedMessages.slice(0, -1);
		}
	};

	const retryLast = async () => {
		const lastUserMessage = [...messages.value].reverse().find((m) => m.role === "user");
		const text = lastUserMessage?.parts.find(
			(p: UIMessage["parts"][number]): p is TextPart => p.type === "text",
		)?.text;

		if (!text) {
			return;
		}

		messages.value = messages.value.slice(0, messages.value.indexOf(lastUserMessage as UIMessage));
		await sendMessage(text);
	};

	const reset = () => {
		messages.value = [];
		status.value = "idle";
		errorKey.value = null;
	};

	return {
		messages: computed(() => messages.value),
		status: computed(() => status.value),
		errorKey: computed(() => errorKey.value),
		isConnecting: computed(() => status.value === "submitted"),
		isStreaming: computed(() => status.value === "streaming"),
		sendMessage,
		retryLast,
		reset,
	};
};
