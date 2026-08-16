import { serve } from "@maizzle/framework";

const portArg = process.argv.find((arg) => arg.startsWith("--port="));
const port = portArg ? Number(portArg.split("=")[1]) : 3005;

await serve({ server: { port } });
