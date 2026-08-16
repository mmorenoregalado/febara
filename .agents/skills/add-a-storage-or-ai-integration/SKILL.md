---
name: add-a-storage-or-ai-integration
description: "Use when extending S3-compatible storage or Vercel AI SDK model and provider flows across workspace packages, oRPC, and Nuxt UI."
---

# Add a storage or AI integration

## Scope

Use for `packages/storage`, `packages/ai`, and related API/UI paths. Do not expose credentials or invoke provider SDKs directly from Vue.

## Procedure

1. Keep storage providers in `packages/storage/provider/`; keep AI models/prompts in `packages/ai/`.
2. For storage extend logical bucket types/config, implement handlers, and export one provider from `provider/index.ts`. Credentials stay server-only; only public bucket names use `NUXT_PUBLIC_`.
3. Follow `packages/storage/provider/s3/index.ts`: lazy-init, validate env, map logical buckets, log failures, and sign URLs. Add local buckets to `docker-compose.yml` `minio-setup` only when required.
4. Expose operations through protected oRPC like `packages/api/modules/users/procedures/create-avatar-upload-url.ts`; authorize paths and never accept arbitrary buckets/keys.
5. For AI configure models in `packages/ai/index.ts`, prompts in `lib/`, and call models server-side. Follow `stream-message.ts` for Zod validation, `safeValidateUIMessages`, and typed event streaming.
6. Add blank env names to `.env.local.example`, dependencies to the owning package, and tests with mocked SDKs. Sanitize unsafe output; `AiChat.vue` uses DOMPurify.
7. Run package/API tests, root gates, and affected app build/E2E.

Canonical reference: `packages/api/modules/ai/procedures/stream-message.ts` bridges AI SDK UI streams to oRPC without exposing `OPENAI_API_KEY`.

## Done

Credentials remain server-side, authorization/input validation is explicit, streams or signed URLs work through oRPC, and tests/builds pass.

## Common mistakes

- Prefixing secret keys with `NUXT_PUBLIC_`.
- Letting clients choose storage buckets/paths.
- Rendering model HTML without sanitization.
