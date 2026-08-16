import { toMerged } from "es-toolkit";

export const mergeScopeAndShared = <T>(
	scopeMessages: Record<string, unknown>,
	sharedMessages: Record<string, unknown>,
): T => toMerged(scopeMessages, sharedMessages) as T;

export const mergeWithDefaultLocale = <T>(
	scopeMessages: Record<string, unknown>,
	sharedMessages: Record<string, unknown>,
	defaultScopeMessages: Record<string, unknown>,
	defaultSharedMessages: Record<string, unknown>,
): T => {
	const defaultMessages = toMerged(defaultScopeMessages, defaultSharedMessages);
	const messages = toMerged(scopeMessages, sharedMessages);

	return toMerged(defaultMessages, messages) as T;
};
