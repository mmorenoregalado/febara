import { build } from "@maizzle/framework";

const env = process.argv[2] ?? "production";

await build({ env });
