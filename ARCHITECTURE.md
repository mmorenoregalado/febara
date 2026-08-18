# ARCHITECTURE.md

Resumen técnico de la arquitectura de **PokeDex Manager**, un monorepo SaaS construido con Nuxt 4 / Vue 3.
Este documento complementa `AGENTS.md` y `CLAUDE.md` (convenciones de desarrollo) con una vista de alto nivel
de la arquitectura: stack, estructura de carpetas, modelos de datos, endpoints principales e integración con
el LLM.

## 1. Stack tecnológico

| Capa                    | Tecnología                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------- |
| Runtime / lenguaje      | Node.js 22+, TypeScript                                                             |
| Framework frontend      | Nuxt 4, Vue 3                                                                       |
| Monorepo / build        | pnpm workspaces + Turborepo                                                         |
| API tipada              | oRPC (RPC + OpenAPI) sobre Hono                                                     |
| Autenticación           | Better Auth (sesiones, organizaciones, passkeys, 2FA, invitaciones)                 |
| Base de datos           | PostgreSQL 16 vía Prisma (`prisma-client` + `prisma-zod-generator`)                 |
| Autorización            | Permix (permisos declarativos por rol/organización)                                 |
| UI                      | Tailwind CSS v4, Nuxt UI, Reka UI                                                   |
| Data fetching (cliente) | TanStack Vue Query sobre un cliente oRPC (`useORPC()`)                              |
| Validación              | Zod 4 (compartida entre input/output de oRPC y formularios)                         |
| i18n                    | `@nuxtjs/i18n` con JSON por locale (`en`, `es`)                                     |
| IA / LLM                | Vercel AI SDK (`ai`) + `@ai-sdk/openai`, `@ai-sdk/google`, `@ai-sdk/anthropic`      |
| MCP                     | `@ai-sdk/mcp` (cliente) + `@modelcontextprotocol/server` (servidor, `packages/mcp`) |
| Almacenamiento          | S3-compatible (MinIO en local) vía `packages/storage`                               |
| Email                   | Plantillas PostHTML + Maizzle 5.x, múltiples proveedores intercambiables            |
| Testing                 | Vitest (unit/integration), Playwright (e2e)                                         |
| Calidad de código       | Oxlint, Oxfmt                                                                       |

## 2. Estructura de carpetas

```text
apps/
├── mail-preview/   # Preview local (Maizzle) de las plantillas de email
├── marketing/      # Sitio público, Nuxt 4 (puerto 3001)
└── saas/           # Producto autenticado, Nuxt 4 (puerto 3000)

packages/
├── ai/             # Wrapper del Vercel AI SDK: modelos, prompts, schemas Zod
├── api/            # Módulos oRPC (routers + procedures) y contexto de la API
├── auth/           # Better Auth: config, cliente, plugins (org, invitaciones)
├── database/       # Prisma: schema, cliente generado, zod schemas, queries
├── i18n/           # Traducciones JSON por locale y config de @nuxtjs/i18n
├── logs/           # Logger compartido
├── mail/           # Envío de email + plantillas HTML (Maizzle)
├── mcp/            # Servidor MCP (tools sobre la colección/PokéAPI), ver sección 5.5
├── notifications/  # Creación de notificaciones, catálogo, tipos
├── permissions/    # Definición y motor de reglas Permix
├── storage/         # Cliente S3-compatible (MinIO en local)
├── ui/             # Componentes UI compartidos (auto-registrados)
└── utils/          # Utilidades genéricas

tooling/
├── scripts/        # CLIs internas
├── tailwind/       # Preset de tema Tailwind compartido
└── typescript/     # tsconfig base compartido
```

Dentro de cada app, el código de producto vive bajo `modules/<feature>/{components,composables,lib,pages...}`
y se auto-importa/auto-registra según la configuración de `nuxt.config.ts` (ver `AGENTS.md`).
En `apps/saas/modules/` los dominios actuales son: `admin`, `ai`, `auth`, `collection`, `dashboard`,
`onboarding`, `organizations`, `pokemon`, `settings`, `shared`.

## 3. Modelo de datos (Prisma)

Fuente única de verdad: `packages/database/prisma/schema.prisma` (PostgreSQL). Modelos principales:

**Identidad y auth (Better Auth)**

- `User` — perfil, rol global (`role`), locale, `onboardingComplete`, `lastActiveOrganizationId`.
- `Session`, `Account`, `Verification`, `Passkey`, `TwoFactor` — sesión, proveedores OAuth/credenciales,
  verificación de email, WebAuthn y 2FA.

**Multi-tenancy (organizaciones)**

- `Organization` — tenant (`slug`, `logo`, `metadata`).
- `Member` — pertenencia usuario↔organización con `role` (`owner` / `admin` / `member`).
- `Invitation` — invitaciones pendientes por email/rol con expiración.

**Notificaciones**

- `Notification` — notificaciones in-app (`type: NotificationType`, `data` JSON, `read`).
- `UserNotificationPreference` — preferencias por `type` × `target` (`IN_APP` / `EMAIL`).
- Enums `NotificationType` (`WELCOME`, `APP_UPDATE`) y `NotificationTarget`.

**Dominio de producto (Pokémon)**

- `CollectionEntry` — relación `User` ↔ `pokemonId` (entero, id de PokéAPI), única por
  `(userId, pokemonId)`; representa la colección personal de Pokémon de cada usuario.

Los datos de Pokémon en sí (nombre, tipos, stats, sprites) **no se persisten**: se obtienen en tiempo real
desde la PokéAPI pública (`packages/api/modules/pokemon/lib/poke-api-client.ts`), con caché en memoria de 24h
tanto para el índice de nombres como para el detalle por id/nombre. La base de datos solo guarda qué
`pokemonId` pertenece a la colección de cada usuario.

Los schemas Zod para cada modelo se generan automáticamente en `packages/database/prisma/zod/` (nunca se
editan a mano).

## 4. Capa de API (oRPC)

Los módulos de dominio viven en `packages/api/modules/<domain>/{procedures,router.ts}` y se registran una
única vez en `packages/api/orpc/router.ts`:

```ts
router = { admin, organizations, users, ai, notifications, pokemon, collection };
```

Tres niveles de procedure (`packages/api/orpc/procedures.ts`):

- **`publicProcedure`** — sin auth, solo `{ headers }`.
- **`protectedProcedure`** — exige sesión Better Auth; resuelve el rol de membresía de la organización
  activa (`session.activeOrganizationId`) y monta el contexto de permisos Permix.
- **`adminProcedure`** — `protectedProcedure` + chequeo Permix `admin.access`.

### Endpoints principales por módulo

| Módulo          | Procedures                                                                                                                            | Notas                                             |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `admin`         | `users.list`, `organizations.list`, `organizations.find`, `organizations.update`                                                      | Requiere `admin.access`                           |
| `organizations` | `generateSlug`, `createLogoUploadUrl`, `deleteLogo`                                                                                   | Gestión de logo vía URLs firmadas de storage      |
| `users`         | `avatarUploadUrl`, `deleteAvatar`                                                                                                     | Avatar vía storage S3-compatible                  |
| `notifications` | `list`, `unreadCount`, `markRead`, `markAllRead`, `getPreferences`, `updatePreference`                                                | In-app + preferencias por tipo/target             |
| `pokemon`       | `list`, `get`                                                                                                                         | Proxy tipado sobre PokéAPI (con caché)            |
| `collection`    | `list`, `add`, `remove`, `contains`                                                                                                   | CRUD de la colección personal (`CollectionEntry`) |
| `ai`            | `stream` (`POST /ai/stream`), `identifyPokemonCard` (`POST /ai/identify-pokemon-card`), `collectionChat` (`POST /ai/collection-chat`) | Ver sección 5                                     |

Las rutas OpenAPI expuestas (`.route({ method, path, tags, summary })`) documentan cada procedure además del
contrato RPC tipado. En el cliente, todo se consume vía `useORPC()` + TanStack Vue Query
(`apps/saas/modules/shared/composables/use-orpc.ts`), con invalidación explícita de queries tras cada mutación
(no hay recarga de página).

## 5. Integración con el LLM

La integración de IA está dividida en dos paquetes:

- **`packages/ai`** — wrapper delgado sobre el **Vercel AI SDK** (`ai`), reexportado junto con instancias de
  modelo ya configuradas y utilidades propias (`packages/ai/lib/{prompts,schemas}.ts`).
- **`packages/api/modules/ai`** — los oRPC procedures que exponen la IA al resto del sistema, con validación
  de input, manejo de errores y reglas de negocio.

### 5.1 Modelos configurados (`packages/ai/index.ts`)

```ts
export const textModel = openai("gpt-4o-mini"); // chat / streaming de texto (POST /ai/stream)
export const imageModel = openai("dall-e-3"); // generación de imágenes (reservado)
export const audioModel = openai("whisper-1"); // transcripción (reservado)
export const geminiModel = google(gemini - 2.5 - flash - lite); // visión multimodal + chat con tools MCP
```

- El proveedor de Google (Gemini) se crea con `createGoogleGenerativeAI` usando `GEMINI_API_KEY`;
  el modelo es configurable vía `GEMINI_MODEL` (`packages/ai/config.ts`, default `gemini-2.5-flash-lite`).
- El proveedor OpenAI usa `OPENAI_API_KEY` vía `@ai-sdk/openai`.
- `@ai-sdk/anthropic` está declarado como dependencia del paquete pero no hay ningún modelo instanciado con él
  todavía (solo `openai(...)` y `google(...)` están en uso activo).
- `geminiModel` (antes `identifyCardModel`) se reutiliza tanto para identificación de cartas (5.3) como
  para el chat de colección vía MCP (5.5) — mismo modelo, misma `GEMINI_API_KEY`, para no exigirle al
  evaluador una segunda API key sólo por la feature bonus.
- Estos son valores server-only; nunca se exponen al cliente.

### 5.2 Endpoint 1 — Chat en streaming (`POST /ai/stream`)

`packages/api/modules/ai/procedures/stream-message.ts`:

1. Requiere sesión (`protectedProcedure`).
2. Input: array de mensajes de UI (`z.array(z.unknown()).min(1).max(100)`), validado con
   `safeValidateUIMessages` del AI SDK (rechaza con `BAD_REQUEST` si el formato es inválido).
3. Convierte los mensajes a formato de modelo (`convertToModelMessages`) y llama a `streamText({ model: textModel, messages })`.
4. La respuesta se transforma a un stream de eventos oRPC (`streamToEventIterator` + `toUIMessageStream()`),
   consumido en el cliente en `apps/saas/modules/ai/components/AiChat.vue` (página `chatbot.vue`). No se
   persiste el historial de chat — es "stateless" por diseño.

### 5.3 Endpoint 2 — Identificación de cartas Pokémon (`POST /ai/identify-pokemon-card`)

`packages/api/modules/ai/procedures/identify-pokemon-card.ts` — flujo multimodal + validación cruzada:

1. **Input**: `imageBase64` + `mimeType` (`image/jpeg` | `image/png` | `image/webp`).
2. **Validación de imagen** (`lib/image-validation.ts`): decodifica base64 de forma estricta (rechaza
   caracteres inválidos, que `Buffer.from` ignoraría silenciosamente), y limita el tamaño a 10 MB
   (`ImageTooLargeError` → `413`). La imagen se procesa **solo en memoria y nunca se persiste**.
3. **Llamada al LLM**: usa `generateText` del AI SDK con `geminiModel` (Gemini), pasando un mensaje
   multimodal con texto (prompt) + `{ type: "file", data: imageBuffer, mediaType }`, y fuerza salida
   estructurada con `Output.object({ schema: CardIdentificationSchema })`:
   ```ts
   CardIdentificationSchema = {
   	identified: boolean,
   	pokemonName: string | null,
   	confidence: "high" | "medium" | "low",
   	reason: string | null,
   };
   ```
4. **Prompt** (`packages/ai/lib/prompts.ts`, `buildCardIdentificationPrompt`): instruye al modelo a
   identificar únicamente la especie de Pokémon representada en la foto de una carta física, ignorando
   set/rareza/precio/condición, y a devolver `identified: false` si no puede identificarla con confianza.
5. **Manejo de errores del LLM**: `NoOutputGeneratedError` (salida no ajustada al schema) se mapea a
   `GeminiInvalidResponseError`; cualquier otro fallo a `GeminiUnavailableError` — ambos se traducen a
   `ORPCError("BAD_GATEWAY")`. Los fallos se loguean vía `@repo/logs` sin filtrar la imagen ni datos sensibles.
6. **Validación cruzada con PokéAPI**: si el modelo identificó una especie, el nombre se busca en PokéAPI
   (`fetchPokemonByIdOrName`) para confirmar que existe y obtener sus datos reales (stats, sprites, tipos).
   Si PokéAPI no la encuentra, la respuesta cae a `identified: false` — el LLM nunca es la única fuente de
   verdad sobre si un Pokémon "existe".
7. **Output** (`IdentifyCardOutputSchema`, unión discriminada por `identified`):
   - `identified: true` → `{ confidence, pokemon: PokemonDetail }` (datos reales de PokéAPI).
   - `identified: false` → `{ confidence, reason }`.

Consumido desde `apps/saas/modules/pokemon/composables/use-pokemon-card-identifier.ts` y los componentes
`PokemonCardUpload.vue` / `PokemonCardIdentifier.vue` / `PokemonIdentificationResult.vue`, en la página
`pages/(authenticated)/pokemon/identify.vue`.

### 5.4 Principios de diseño de la integración IA

- **Nunca confiar ciegamente en el LLM**: toda identificación se re-valida contra una fuente de datos
  determinista (PokéAPI) antes de considerarse "identificada".
- **Sin persistencia de contenido sensible**: ni las imágenes de cartas ni el historial de chat se guardan
  en base de datos.
- **Salida estructurada obligatoria** vía Zod (`Output.object`) en vez de parsear texto libre.
- **Errores del proveedor aislados** del resto del dominio mediante clases de error propias
  (`GeminiUnavailableError`, `GeminiInvalidResponseError`) mapeadas a códigos oRPC estables.
- **Multi-proveedor por diseño**: `packages/ai` permite mezclar proveedores (OpenAI para texto/chat, Google
  para visión) detrás de una única interfaz basada en el Vercel AI SDK, facilitando swap futuro (p. ej.
  Anthropic, ya declarado como dependencia).

### 5.5 Chat sobre la colección vía MCP (`POST /ai/collection-chat`)

Feature bonus: expone la colección del usuario y PokéAPI como **tools MCP** estándar (protocolo
[Model Context Protocol](https://modelcontextprotocol.io)), consumidas por un chat con LLM.
Resumen de la arquitectura resultante:

- **Servidor MCP** (`packages/mcp`, paquete hermano de `packages/api`): construye un `McpServer`
  (`@modelcontextprotocol/server`) con cuatro tools —`get_collection`, `search_pokemon`,
  `get_pokemon_stats`, `identify_pokemon_card`— y lo expone por **Streamable HTTP** en `/api/mcp`
  (montado en el `Hono` app de `packages/api/index.ts`). Cada tool **no importa lógica interna de
  `packages/api`**: hace un `fetch()` a los endpoints REST/OpenAPI ya existentes
  (`GET /api/collection`, `GET /api/pokemon`, `GET /api/pokemon/{idOrName}`,
  `POST /api/ai/identify-pokemon-card`), reenviando la cookie de sesión del caller
  (`packages/mcp/lib/api-client.ts`, que soporta tanto `GET` con query params como `POST` con body
  JSON y timeout configurable — este último usado sólo por `identify_pokemon_card`, ya que una
  llamada a Gemini con visión tarda más que un lookup de PokéAPI). Esto evita un ciclo de
  dependencias (`packages/api` monta `@repo/mcp`; `packages/mcp` nunca importa `@repo/api`) y
  reutiliza sin duplicar la caché de 24h de PokéAPI, las queries de Prisma, y la identificación de
  cartas (`identify-pokemon-card.ts`) que ya usan `pokemon`/`collection`/`ai`.
- **`identify_pokemon_card`** necesita los bytes de la imagen (`imageBase64`/`mimeType`) como
  argumento de la tool, igual que el endpoint que envuelve. Es utilizable por cualquier cliente MCP
  que ya tenga la imagen (Inspector, Claude Desktop, un script), pero **no** desde el chat de texto
  propio (`collection-chat`, 5.5 más abajo): ese endpoint sólo acepta mensajes de texto, y un LLM
  no puede generar en un tool-call bytes de una imagen que nunca vio como texto en el contexto.
- **`search_pokemon`** además filtra por tipo: `pokemon.list` (`list-pokemon.ts`) gana un parámetro
  `type` opcional que golpea `GET /type/{type}` de PokéAPI (`fetchPokemonNamesByType`, mismo patrón de
  caché en memoria que el resto de `poke-api-client.ts`) — mejora que beneficia también al endpoint REST,
  no sólo a la tool.
- **Cliente MCP ↔ LLM**: `packages/api/modules/ai/procedures/chat-with-collection.ts` sigue el mismo
  patrón que `stream-message.ts` (`protectedProcedure`, streaming), pero antes de llamar al modelo crea
  un cliente MCP con `createMCPClient` de `@ai-sdk/mcp` (re-exportado desde `@repo/ai`) apuntando a
  `/api/mcp` (loopback interno), reenviando la cookie de sesión, y pasa `await mcpClient.tools()` a
  `streamText({ model: geminiModel, tools, stopWhen: stepCountIs(5) })` — `stopWhen` habilita que el
  modelo llame una tool y luego responda en lenguaje natural. El cliente se cierra (`mcpClient.close()`)
  al terminar o fallar el stream.
- **Auth de punta a punta sin mecanismo paralelo**: la ruta `/api/mcp` no valida sesión por sí misma —
  cada tool reenvía la cookie recibida al endpoint REST correspondiente, que sí es `protectedProcedure` y
  resuelve la sesión con `auth.api.getSession` exactamente igual que cualquier otra request. Un evaluador
  puede probar el servidor MCP en forma standalone (MCP Inspector) copiando su cookie de sesión tras
  loguearse en el navegador — ver `README.md`.
- **Errores**: un `fetch` fallido/`401`/`404`/`5xx` desde una tool se traduce a un resultado MCP con
  `isError: true` (el LLM lo ve como parte de la conversación, no como un crash del stream); un fallo de
  conexión del `createMCPClient` en sí se mapea a `ORPCError("BAD_GATEWAY")` (`McpUnavailableError`).

## 6. Autenticación, multi-tenancy y permisos

- **Better Auth** (`packages/auth`) gestiona sesiones, cuentas OAuth/credenciales, passkeys (WebAuthn), 2FA e
  invitaciones a organizaciones. Cliente: `useSession()`, `useAuthClient()`.
- Las **organizaciones** son el límite de tenancy; la sesión lleva `activeOrganizationId`, resuelto por
  `protectedProcedure` a un rol de membresía (`owner` / `admin` / `member`).
- **Permix** (`packages/permissions`) declara el esquema de permisos (`admin.access`,
  `organization.{read,manage,delete}`) y construye las reglas a partir de usuario + rol de membresía. Se usa
  tanto en el servidor (oRPC, `packages/api/orpc/permix.ts`) como en el cliente SaaS (instancia por-app en
  `apps/saas/plugins/permix.ts`, ya que Nitro es multi-request).

## 7. Notificaciones e i18n

- **Notificaciones**: `createNotification` (`packages/notifications/src/create-notification.ts`) crea
  notificaciones server-side; tipos/kinds en `types.ts`, catálogo de configuración en `catalog.ts`. Al añadir
  un tipo hay que sincronizar el enum de Prisma, el catálogo y las etiquetas i18n.
- **i18n**: JSON por locale en `packages/i18n/translations/{en,es}/{saas,marketing}.json`, consumidos
  vía wrappers tipados `useTranslations()` por app (nunca llamadas crudas a `@nuxtjs/i18n`). Toda cadena
  visible requiere las cuatro variantes de locale.

## 8. Integraciones intercambiables (mail / storage / ai)

`packages/{mail,storage,ai}` siguen el mismo patrón: un `config.ts` selecciona el proveedor activo por
variable de entorno, y `provider/index.ts` expone una interfaz común detrás de múltiples implementaciones:

- `packages/mail/provider/` — Resend, Postmark, Mailgun, Nodemailer, y una consola de desarrollo (fallback).
  Plantillas HTML estáticas (PostHTML) en `packages/mail/emails/*.html`, renderizadas con Maizzle 5.x
  (fijado — Maizzle 6 rompe estas plantillas) y previsualizables vía `apps/mail-preview`.
- `packages/storage/provider/s3` — cliente compatible con S3 (MinIO en local) para logos de organización y
  avatares de usuario, vía URLs de subida firmadas generadas por oRPC procedures.
- `packages/ai` — ver sección 5.

## 9. Flujo end-to-end de ejemplo: identificar una carta Pokémon

```
Usuario sube foto (PokemonCardUpload.vue)
   → composable use-pokemon-card-identifier.ts
   → orpc.ai.identifyPokemonCard.mutate({ imageBase64, mimeType })
   → protectedProcedure valida sesión
   → decodeAndValidateImage() valida tamaño/formato en memoria
   → generateText({ model: geminiModel(Gemini), Output.object(CardIdentificationSchema) })
   → si identified=true: fetchPokemonByIdOrName() confirma contra PokéAPI real
   → IdentifyCardOutputSchema (unión discriminada)
   → PokemonIdentificationResult.vue renderiza el resultado
```

Este flujo ilustra el patrón general del repo: **oRPC tipado de punta a punta + Zod como contrato + Prisma
para persistencia de negocio + servicios externos (PokéAPI, LLM) tratados como fuentes no confiables que se
validan antes de devolver al cliente.**
