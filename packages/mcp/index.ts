import { createMcpHandler } from "@modelcontextprotocol/server";
import { Hono } from "hono";

import { createPokedexMcpServer } from "./server";

const handler = createMcpHandler(() => createPokedexMcpServer());

/**
 * Streamable HTTP transport for the PokeDex Manager MCP server, mounted by
 * `packages/api` at `/api/mcp`. `createMcpHandler` calls the factory per
 * HTTP request/exchange, so a fresh `McpServer` is built for each one —
 * required because `McpServer.connect()`/`close()` bind to a single
 * transport at a time; sharing one instance across requests let one
 * request's `close()` tear down another's in-flight connection (tools
 * themselves are stateless and read the caller's session cookie per-request
 * from `ctx.http.req`, see `packages/mcp/lib/api-client.ts`).
 */
export const mcpApp = new Hono().all("/", (c) => handler.fetch(c.req.raw));

export { createPokedexMcpServer } from "./server";
