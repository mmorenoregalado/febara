import { createMcpHandler } from "@modelcontextprotocol/server";
import { Hono } from "hono";

import { createPokedexMcpServer } from "./server";

const server = createPokedexMcpServer();
const handler = createMcpHandler(() => server);

/**
 * Streamable HTTP transport for the PokeDex Manager MCP server, mounted by
 * `packages/api` at `/api/mcp`. A single `McpServer` instance is reused
 * across requests — tools are stateless and read the caller's session
 * cookie per-request from `ctx.http.req` (see `packages/mcp/lib/api-client.ts`).
 */
export const mcpApp = new Hono().all("/", (c) => handler.fetch(c.req.raw));

export { createPokedexMcpServer } from "./server";
