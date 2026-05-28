# Fantano FAV TRACKS -> Spotify

Builds a Spotify playlist of every song Anthony Fantano has ever called a FAV TRACK across his album/EP/mixtape/track reviews, plus the highlight tracks from his Weekly Track Roundups.

Pipeline: yt-dlp scrapes [theneedledrop](https://www.youtube.com/theneedledrop), regex pulls the FAV TRACKS lines (and the BEST tracks from roundup chapters/descriptions), Spotipy fuzzy-searches each track, then writes/updates one big playlist on your account.

## How it works

1. **fetch** - list every video on the channel, filter to reviews and Weekly Track Roundups, fetch full descriptions + chapter markers via `yt-dlp`. Cached to `data/videos.json`.
2. **parse** - reviews: pull artist/album from the title and the comma-separated FAV TRACKS line from the description. Roundups: walk chapter markers (or fall back to the description's "Best Tracks:" block), keep tracks tagged BEST/PLATINUM/GOLD/STRONG/HIGHLIGHT, skip WORST/WEAK/NOT GOOD. Cached to `data/parsed.json`.
3. **match** - for every track, hit Spotify search with `track:"..." artist:"..." album:"..."`, then fall back to looser queries. Score each candidate with rapidfuzz (artist similarity + track similarity, threshold 78). Cached to `data/spotify_matches.json`; misses to `data/unmatched.json`.
4. **build** - create the playlist if missing, dedupe against existing tracks, add new URIs in batches of 100.

Every stage is incremental: re-running only does work that isn't already cached.

## Setup

```bash
cd ~/Desktop/2026-Code/fantano
uv sync
```

Create a Spotify app at [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard):

- Redirect URI: `http://127.0.0.1:8888/callback`
- Copy the Client ID + Client Secret into `.env` (see `.env.example`).

## Usage

```bash
# end-to-end
uv run fantano run

# or one stage at a time
uv run fantano fetch --limit 100   # smoke test on a slice
uv run fantano parse
uv run fantano match
uv run fantano build

# inspect state
uv run fantano stats
```

Only album/track reviews:

```bash
uv run fantano fetch --reviews-only
```

Only Weekly Track Roundups:

```bash
uv run fantano fetch --roundups-only
```

## Files

| File                        | What it holds                                                      |
| --------------------------- | ------------------------------------------------------------------ |
| `data/videos.json`          | Raw video metadata (id, title, description, chapters, upload_date) |
| `data/parsed.json`          | One record per review/roundup with extracted artist/track tuples   |
| `data/spotify_matches.json` | Search cache keyed by `artist\|album\|track`                       |
| `data/unmatched.json`       | Tracks Spotify search couldn't confidently resolve                 |
| `data/playlist_state.json`  | Resulting playlist id / URL / track count                          |
| `.spotipy_cache`            | Spotipy's user-token cache (auto-managed)                          |

All glory to God!
