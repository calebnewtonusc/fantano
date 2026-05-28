# Fantano

An AI-searchable database of every song Anthony Fantano (theneedledrop) has ever flagged as a FAV TRACK in an album review or a BEST TRACK in a Weekly Track Roundup.

Ask it for music in plain English:

- "Give me 100 folk songs"
- "Best hip hop tracks of 2014"
- "Recent shoegaze"
- "Anything on TDE"

## Architecture

```
YouTube (theneedledrop)
        |
        v
Python worker (uv + yt-dlp + psycopg)         <-- cron daily on Railway
        |  fetch -> parse -> sync
        v
Railway Postgres  (1 DB, 2 tables)
   |
   |----  album_tracks   review FAVs with full album metadata
   |       (track, artist, album, release_year, label, genres[])
   |
   |----  singles        roundup BEST picks
           (track, artist, release_year)
        |
        v
Next.js web app (Anthropic Sonnet 4.6 tool-use)   <-- Railway service
   |
   |  POST /api/search { prompt }
   |    -> LLM extracts SearchFilter via tool call
   |    -> SQL UNION across both tables
   |    -> returns ranked Track[]
```

See [RAILWAY.md](./RAILWAY.md) for deploy instructions.

## Repo layout

| Path            | What                                                                   |
| --------------- | ---------------------------------------------------------------------- |
| `src/fantano/`  | Python package: `fetch`, `parse`, `sync`, `export`, `cli`, `spotify`   |
| `db/schema.sql` | Postgres schema, auto-applied by the worker on every run               |
| `worker/`       | `Dockerfile` for the cron worker service on Railway                    |
| `apps/web/`     | Next.js 16 + Tailwind 4 + shadcn-style UI, `/api/search`, `/api/stats` |
| `data/`         | Local pipeline cache (`videos.json`, `parsed.json`) - gitignored       |
| `tracks.csv`    | Optional CSV export when running with `--skip-sync` - gitignored       |

## How the pipeline works

1. **fetch** - lists every video on the channel via `yt-dlp`, filters titles to album/EP/mixtape/track reviews + Weekly Track Roundups, fetches the full description for each. Cached to `data/videos.json`.
2. **parse** - for reviews: pulls artist/album from the title, the comma-separated FAV TRACKS line from the description, and the slash-delimited tag line (`ARTIST - ALBUM / 2026 / LABEL / GENRE, GENRE`) for release year + label + genres. For roundups: parses chapter markers (modern videos) or the `!!!BEST TRACKS THIS WEEK!!!` ... `...meh...` section of the description.
3. **sync** - upserts review tracks into `album_tracks` and roundup tracks into `singles`, deduping on `(video_id, lower(track), lower(artist))`.

Every stage is incremental: re-running only does work that isn't already cached.

## CLI

```bash
uv sync

# production pipeline (fetch -> parse -> sync)
uv run fantano run

# subset / debug
uv run fantano fetch --limit 50
uv run fantano fetch --reviews-only
uv run fantano fetch --roundups-only
uv run fantano parse
uv run fantano sync               # parsed.json -> Postgres
uv run fantano csv                # parsed.json -> tracks.csv (skip Postgres)
uv run fantano stats              # local pipeline counts
uv run fantano run --skip-sync    # full pipeline, CSV instead of Postgres
```

## Web app

```bash
cd apps/web
cp .env.example .env.local        # set DATABASE_URL + ANTHROPIC_API_KEY
pnpm install
pnpm dev
```

`/api/search` accepts `POST { prompt: string }` and returns:

```ts
{
  data: {
    filter: SearchFilter,    // what the LLM extracted
    tracks: Track[],         // matched rows
    total: number,           // total matches before LIMIT
    explanation: string      // one-line plain-English summary
  }
}
```

## Spotify export (parked)

The `spotify` module (Spotipy + rapidfuzz fuzzy-match) is still in the repo but not wired into the default pipeline. The CSV exporter is the current handoff to Spotify — pair it with [isacmlee/csv-to-playlist](https://github.com/isacmlee/csv-to-playlist) to push tracks into a playlist. When we want first-class Spotify support inside the app, the existing matching code lifts cleanly.

All glory to God!
