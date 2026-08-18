# PokeDex Manager

PokeDex Manager is a production-ready, scalable SaaS application for managing PokeDex data.

## Getting Started

### 1. Environment

Copy the example env file and configure your local credentials:

```bash
cp .env.local.example .env.local
```

For local development, set the following values in `.env.local`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pokedex_manager"

S3_ACCESS_KEY_ID="minioadmin"
S3_SECRET_ACCESS_KEY="minioadmin"
S3_ENDPOINT="http://localhost:9000"
S3_REGION="us-east-1"
```

### 2. Start local services

Start PostgreSQL and MinIO using Docker Compose:

```bash
docker compose up -d
```

This starts:

- **PostgreSQL 16** on `localhost:5432`
- **MinIO** (S3-compatible storage) on `localhost:9000` — console at `http://localhost:9001`
- **minio-setup** — auto-creates the `avatars` bucket on first run

### 3. Install dependencies

```bash
pnpm install
```

### 4. Run database migrations

```bash
pnpm --filter @repo/database push
```

### 5. Start the development server

```bash
pnpm dev
```

| App       | URL                   |
| --------- | --------------------- |
| SaaS      | http://localhost:3000 |
| Marketing | http://localhost:3001 |
| Docs      | http://localhost:3002 |

## MCP

The SaaS app exposes the user's Pokémon collection, PokéAPI search, and card identification as
**MCP tools** (`get_collection`, `search_pokemon`, `get_pokemon_stats`, `identify_pokemon_card`)
over Streamable HTTP at `http://localhost:3000/api/mcp`, and a chat endpoint
(`POST /ai/collection-chat`) that connects an LLM to those tools so you can ask natural-language
questions about your collection. See `ARCHITECTURE.md` section 5.5 for the full design notes and
rationale.

`identify_pokemon_card` wraps the same endpoint as the `/pokemon/identify` page
(`POST /api/ai/identify-pokemon-card`), so it needs actual image bytes (base64) as input — the
in-app text chat can't trigger it today (it only accepts text messages), but any MCP client that
already has the image (Inspector with a pasted/uploaded base64 string, Claude Desktop, a script)
can call it directly.

The chat itself is exposed in the SaaS app as a drawer on the `/collection` page (the "Ask about
my collection" button in the page header) — it talks to `POST /ai/collection-chat`, which streams
an LLM response backed by the same MCP tools. `identify_pokemon_card` is the one tool the in-app
chat can't trigger (see above), so to exercise it, or to inspect the raw MCP protocol/tool schemas
directly, use MCP Inspector or the tools' underlying REST endpoints as described below.

### Get a session cookie (needed for both options below)

`/api/mcp` and its tools require an authenticated session — same as `pokemon.list`/`pokemon.get`
today, both already `protectedProcedure`.

1. `pnpm dev`, then log into the SaaS app at `http://localhost:3000` in your browser.
2. Open devtools → **Application** (Chrome) or **Storage** (Firefox) → Cookies →
   `http://localhost:3000`.
3. Copy the **value** of the `better-auth.session_token` cookie (not the name, just the value).

### Try the MCP server with MCP Inspector

```bash
npx @modelcontextprotocol/inspector
```

This opens a local web UI at `http://localhost:6274` (or similar — check the terminal output).
In newer Inspector versions, servers are managed as named entries under **Servers**:

1. Click **Add Servers → + Add manually**.
2. Fill in the form:
   - **Name**: anything, e.g. `pokedex-mcp`.
   - **Transport Type**: `Streamable HTTP` (not `STDIO`).
   - **URL**: `http://localhost:3000/api/mcp`
   - Expand **Custom Headers** (sometimes under an "Advanced" toggle) and add one header:
     - Key: `Cookie`
     - Value: `better-auth.session_token=<the value you copied above>`
3. Save, then connect — the server should show as **Connected**.
4. Open the **Tools** tab. You should see `get_collection`, `search_pokemon`,
   `get_pokemon_stats`, and `identify_pokemon_card`. Try:
   - `get_collection` with no arguments.
   - `search_pokemon` with `{ "type": "water" }` or `{ "name": "char" }`.
   - `get_pokemon_stats` with `{ "idOrName": "pikachu" }`.
   - `identify_pokemon_card` with `{ "imageBase64": "<base64 of a card photo>", "mimeType": "image/jpeg" }`
     — e.g. `imageBase64=$(base64 -i card.jpg)` in a terminal, then paste the value in. This one
     can take several seconds (it calls the Gemini vision model).

If your Inspector version only exposes a single "Bearer Token"/"Authorization" field instead of
arbitrary custom headers, use the sidebar connection settings for the server and look for a
"Header Name" override so you can send `Cookie` instead of `Authorization`.

### Try it via curl / REST (no Inspector needed)

The tools are thin wrappers over existing REST endpoints, so you can also just call those
directly with the session cookie, without going through the MCP protocol at all:

```bash
curl http://localhost:3000/api/collection \
  -H "Cookie: better-auth.session_token=<value>"

curl "http://localhost:3000/api/pokemon?type=water&limit=5" \
  -H "Cookie: better-auth.session_token=<value>"

curl http://localhost:3000/api/pokemon/pikachu \
  -H "Cookie: better-auth.session_token=<value>"

curl -X POST http://localhost:3000/api/ai/identify-pokemon-card \
  -H "Cookie: better-auth.session_token=<value>" \
  -H "Content-Type: application/json" \
  -d "{\"imageBase64\": \"$(base64 -i card.jpg)\", \"mimeType\": \"image/jpeg\"}"
```

### Security note

Forwarding the caller's session cookie directly to `/api/mcp` (and from each MCP tool to its
underlying REST endpoint) is a simplified auth mechanism appropriate for this technical test,
where the MCP server is mounted in-process in the same app as a trusted internal call. In a
production system with a separately-deployed MCP server, this would instead use a short-lived,
narrowly-scoped service token (e.g. minted per-request from the user's session and passed as a
bearer token) or a proper OAuth service-to-service exchange, rather than forwarding the user's
actual session cookie across a process/trust boundary.
