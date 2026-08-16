import type { Locale } from "@repo/i18n";
import { logger } from "@repo/logs";

import { send } from "./provider";
import { getMailMessagesForLocale } from "./util/load-mail-translations";
import { buildLocalizedMailContent, type MailTemplateId } from "./util/localize-context";
import { assetValueToString, loadNitroAssetStorage, normalizeAssetKey } from "./util/nitro-assets";
import { mailTemplates } from "./util/templates";

/**
 * Email theme colors – must stay in sync with email-theme.js
 * (which is consumed by the mail-preview Tailwind config via CJS require).
 */
const emailThemeColors: Record<string, string> = {
	primary: "#64748b",
	"primary-foreground": "#ffffff",
	foreground: "#18181b",
	"muted-foreground": "#71717a",
	"highlighted-foreground": "#09090b",
	background: "#ffffff",
	"muted-background": "#fafafa",
	"elevated-background": "#f4f4f5",
	border: "#e4e4e7",
	card: "#ffffff",
};

export type { Locale };

export type SendEmailParams<TemplateId extends keyof typeof mailTemplates> = {
	to: string;
	locale: Locale;
	templateId?: TemplateId;
	context?: Record<string, unknown>;
	subject?: string;
	text?: string;
	html?: string;
};

type RenderedTemplate = {
	html: string;
	text: string;
};

type ServerDeps = {
	fs: typeof import("node:fs/promises");
	os: typeof import("node:os");
	path: typeof import("node:path");
	url: typeof import("node:url");
	maizzle: typeof import("@maizzle/framework");
};

let serverDepsPromise: Promise<ServerDeps> | null = null;
let materializedMailAssetsRootPromise: Promise<string | null> | null = null;

/** Nuxt/Nitro set `import.meta.server`; cast avoids TS errors when `ImportMeta` has no `server` (e.g. API package check). */
type ImportMetaWithServer = ImportMeta & { readonly server?: boolean };

const isServerRuntime = () => {
	if ((import.meta as ImportMetaWithServer).server === true) {
		return true;
	}

	return typeof process !== "undefined" && Boolean(process.versions?.node);
};

const loadServerDeps = () => {
	if (!isServerRuntime()) {
		throw new Error("sendEmail can only be used on the server");
	}

	if (!serverDepsPromise) {
		serverDepsPromise = Promise.all([
			import("node:fs/promises"),
			import("node:os"),
			import("node:path"),
			import("node:url"),
			import("@maizzle/framework"),
		]).then(([fs, os, path, url, maizzle]) => ({
			fs,
			os,
			path,
			url,
			maizzle,
		}));
	}

	return serverDepsPromise;
};

const materializeMailAssets = async (deps: ServerDeps) => {
	if (!materializedMailAssetsRootPromise) {
		materializedMailAssetsRootPromise = (async () => {
			const storage = await loadNitroAssetStorage("mail");

			if (!storage) {
				return null;
			}

			const assetKeys = (await storage.getKeys())
				.map(normalizeAssetKey)
				.filter((key) => key.endsWith(".html"));

			if (assetKeys.length === 0) {
				return null;
			}

			const root = deps.path.join(deps.os.tmpdir(), "repo-mail-assets");
			await deps.fs.rm(root, { recursive: true, force: true });

			for (const key of assetKeys) {
				const value = await storage.getItem(key);
				const source = assetValueToString(value);

				if (source === null) {
					continue;
				}

				const filePath = deps.path.join(root, ...key.split("/"));
				await deps.fs.mkdir(deps.path.dirname(filePath), { recursive: true });
				await deps.fs.writeFile(filePath, source, "utf8");
			}

			return root;
		})();
	}

	return materializedMailAssetsRootPromise;
};

const resolveTemplatePath = async (filePath: string, deps: ServerDeps) => {
	const { fs, path, url } = deps;
	const candidates = [
		path.resolve(process.cwd(), "packages", "mail", filePath),
		path.resolve(process.cwd(), "..", "..", "packages", "mail", filePath),
		path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), filePath),
	];

	for (const candidate of candidates) {
		try {
			await fs.access(candidate);
			return candidate;
		} catch {
			// Try next candidate.
		}
	}

	const materializedRoot = await materializeMailAssets(deps);

	if (materializedRoot) {
		const materializedTemplatePath = path.join(materializedRoot, filePath);

		try {
			await fs.access(materializedTemplatePath);
			return materializedTemplatePath;
		} catch {
			// Fall through to the original path for a clear read error.
		}
	}

	// `candidates` is always a fixed-length list; `[]` indexing is `string | undefined` under
	// `noUncheckedIndexedAccess`, so we assert for the read error path below.
	return candidates[0]!;
};

const readHtmlFiles = async (directoryPath: string, deps: ServerDeps): Promise<string[]> => {
	const { fs, path } = deps;
	const entries = await fs.readdir(directoryPath, { withFileTypes: true });
	const sources: string[] = [];

	for (const entry of entries) {
		const entryPath = path.join(directoryPath, entry.name);

		if (entry.isDirectory()) {
			sources.push(...(await readHtmlFiles(entryPath, deps)));
			continue;
		}

		if (entry.isFile() && entry.name.endsWith(".html")) {
			sources.push(await fs.readFile(entryPath, "utf8"));
		}
	}

	return sources;
};

const collectComponentSources = async (
	templatePath: string,
	deps: ServerDeps,
): Promise<string[]> => {
	const { path } = deps;
	const templateDir = path.dirname(templatePath);
	const componentDirs = [path.join(templateDir, "layouts"), path.join(templateDir, "partials")];
	const sources: string[] = [];

	for (const dir of componentDirs) {
		try {
			sources.push(...(await readHtmlFiles(dir, deps)));
		} catch {
			// Ignore missing component folders.
		}
	}

	return sources;
};

const renderMaizzleTemplate = async (
	filePath: string,
	context: Record<string, unknown>,
): Promise<RenderedTemplate> => {
	const deps = await loadServerDeps();
	const templatePath = await resolveTemplatePath(filePath, deps);
	const templateSource = await deps.fs.readFile(templatePath, "utf8");
	const componentSources = await collectComponentSources(templatePath, deps);
	const componentsRoot = deps.path.dirname(templatePath);
	const { html } = await deps.maizzle.render(templateSource, {
		locals: context,
		components: {
			root: componentsRoot,
		},
		css: {
			inline: {},
			tailwind: {
				content: [templateSource, ...componentSources].map((raw) => ({
					raw,
					extension: "html",
				})),
				corePlugins: {
					preflight: false,
				},
				theme: {
					extend: {
						colors: emailThemeColors,
					},
				},
			},
		},
	});
	const text = await deps.maizzle.generatePlaintext(html);

	return { html, text };
};

export const sendEmail = async <TemplateId extends keyof typeof mailTemplates>({
	to,
	locale,
	templateId,
	context = {},
	subject,
	text,
	html,
}: SendEmailParams<TemplateId>) => {
	try {
		// If no templateId is provided, send a plain email
		if (!templateId) {
			if (!subject) {
				throw new Error("Subject is required when templateId is not provided");
			}
			await send({
				to,
				subject,
				text: text ?? "",
				html: html,
			});
			return true;
		}

		// Otherwise, render the template
		const templateData = mailTemplates[templateId];

		if (!templateData) {
			throw new Error(`Template ${templateId} not found`);
		}

		const translations = await getMailMessagesForLocale(locale);
		const localized = buildLocalizedMailContent(
			templateId as MailTemplateId,
			translations,
			context,
		);
		const renderContext = {
			...localized.context,
			...context,
		};

		({ html, text } = await renderMaizzleTemplate(templateData.file, renderContext));

		await send({
			to,
			subject: subject ?? localized.subject,
			text,
			html,
		});

		return true;
	} catch (error) {
		logger.error(error);
		return false;
	}
};

export * from "./provider";
export * from "./types";
export * from "./util/templates";
