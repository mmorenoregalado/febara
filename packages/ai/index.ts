import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";

import { config } from "./config";

const google = createGoogleGenerativeAI({ apiKey: config.gemini.apiKey });

export const textModel = openai("gpt-4o-mini");
export const imageModel = openai("dall-e-3");
export const audioModel = openai("whisper-1");
export const geminiModel = google(config.gemini.model);

export * from "ai";
// Named (not `export *`) — avoids an ambiguous-export conflict with `ai`'s
// own re-export surface that breaks Vite/Nitro's dev-time module resolution.
export { createMCPClient } from "@ai-sdk/mcp";
export * from "./lib";
