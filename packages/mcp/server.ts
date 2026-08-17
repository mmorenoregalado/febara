import { McpServer } from "@modelcontextprotocol/server";

import { registerGetCollectionTool } from "./tools/get-collection";
import { registerGetPokemonStatsTool } from "./tools/get-pokemon-stats";
import { registerSearchPokemonTool } from "./tools/search-pokemon";

export function createPokedexMcpServer(): McpServer {
	const server = new McpServer({ name: "pokedex-manager", version: "1.0.0" });

	registerGetCollectionTool(server);
	registerSearchPokemonTool(server);
	registerGetPokemonStatsTool(server);

	return server;
}
