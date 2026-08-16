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
