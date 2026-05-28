# Railway deployment

The project deploys as three Railway services in one project:

```
fantano  (Railway project)
├── postgres        Railway Postgres add-on (1 DB, 2 tables: album_tracks + singles)
├── fantano-web     Next.js search UI (Dockerfile: apps/web/Dockerfile)
└── fantano-worker  Python pipeline, runs on cron (Dockerfile: worker/Dockerfile)
```

## 1. Provision Postgres

In the Railway project, **+ New > Database > Postgres**. The plugin sets `DATABASE_URL` automatically.

The schema is applied by the worker on every run (`CREATE TABLE IF NOT EXISTS`), so there's nothing to migrate manually.

## 2. Deploy `fantano-web`

**+ New > GitHub Repo > calebnewtonusc/fantano**.

Service settings:

- **Root directory:** `apps/web`
- **Build:** Dockerfile (auto-detected)
- **Variables:**
  - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`
  - `ANTHROPIC_API_KEY` = (your Anthropic key)
  - `NEXT_PUBLIC_APP_URL` = (the Railway-assigned URL once known)
- **Networking:** enable a public domain.

## 3. Deploy `fantano-worker`

**+ New > GitHub Repo > calebnewtonusc/fantano** (same repo, second service).

Service settings:

- **Root directory:** `/` (repo root — the worker needs `pyproject.toml`, `src/`, `db/`)
- **Dockerfile path:** `worker/Dockerfile`
- **Variables:**
  - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`
  - `FANTANO_CHANNEL_URL` = `https://www.youtube.com/theneedledrop` (optional, has a default)
  - `DATA_DIR` = `/data`
- **Volume:** attach a volume mounted at `/data` so the `videos.json` cache survives between runs. Subsequent runs then only fetch _new_ videos (saves ~80 min per run).
- **Cron schedule:** `0 7 * * *` (daily 07:00 UTC = 00:00 PT). Set via the service's Cron field.

## 4. First-run seed (one-time)

The first cron run will scrape the full channel (~5,000 videos, ~80 min wall clock). To kick it off immediately rather than wait for the cron tick, hit **Deploy > Run Now** on the worker service.

Alternatively, seed locally and push the parsed data:

```bash
cd ~/Desktop/2026-Code/fantano
uv run fantano fetch
uv run fantano parse
DATABASE_URL=<railway dsn> uv run fantano sync
```

## 5. Verify

Visit the web service URL. The stats row at the top of the page should show non-zero counts. Try the search bar:

- "Give me 100 folk songs"
- "Best hip hop tracks of 2014"
- "Singles from last year"

## Local dev

```bash
# Postgres (Docker)
docker run --name fantano-pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16

# Python pipeline (one-shot)
cd ~/Desktop/2026-Code/fantano
echo 'DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres' >> .env
uv run fantano run --limit 50

# Web
cd apps/web
cp .env.example .env.local  # edit DATABASE_URL + ANTHROPIC_API_KEY
pnpm install
pnpm dev
```
