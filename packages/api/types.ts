/**
 * Configuration surface for the shared API package.
 */
export type ApiConfig = {
	/** Canonical base URL of the SaaS app, used for internal loopback calls (e.g. the MCP server). */
	saasUrl: string;
};
