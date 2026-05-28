"""Enrich tracks with Spotify metadata (cover art, preview URL, popularity, URI).

Uses Spotify's Client Credentials flow (no user OAuth needed for search). Hits
search with `track:"..." artist:"..." album:"..."` then falls back to a looser
query, scores candidates with rapidfuzz, and writes the winner back to Postgres.
"""
from __future__ import annotations

import base64
import os
import time
from typing import Iterable

import psycopg
import requests
from dotenv import load_dotenv
from psycopg.rows import dict_row
from rapidfuzz import fuzz
from rich.console import Console
from rich.progress import (
    BarColumn,
    MofNCompleteColumn,
    Progress,
    SpinnerColumn,
    TextColumn,
    TimeElapsedColumn,
)

from .paths import ROOT

console = Console()

SCHEMA_SQL = ROOT / "db" / "schema.sql"
GOOD_MATCH = 78


def _dsn() -> str:
    load_dotenv()
    dsn = os.getenv("DATABASE_URL")
    if not dsn:
        raise SystemExit("DATABASE_URL is not set.")
    return dsn


def _spotify_token() -> str:
    cid = os.getenv("SPOTIFY_CLIENT_ID")
    secret = os.getenv("SPOTIFY_CLIENT_SECRET")
    if not cid or not secret:
        raise SystemExit("Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET.")
    creds = base64.b64encode(f"{cid}:{secret}".encode()).decode()
    r = requests.post(
        "https://accounts.spotify.com/api/token",
        headers={"Authorization": f"Basic {creds}"},
        data={"grant_type": "client_credentials"},
        timeout=20,
    )
    r.raise_for_status()
    return r.json()["access_token"]


def _score(cand: dict, want_artist: str, want_track: str) -> float:
    cand_artists = " ".join(a["name"] for a in cand.get("artists", []))
    a = fuzz.token_set_ratio(want_artist.lower(), cand_artists.lower())
    t = fuzz.token_set_ratio(want_track.lower(), (cand.get("name") or "").lower())
    return 0.5 * a + 0.5 * t


class RateLimitExceeded(Exception):
    """Raised when Spotify hands back a Retry-After we shouldn't sit on."""


def _search(token: str, q: str, limit: int = 5, max_wait: int = 90) -> list[dict]:
    r = requests.get(
        "https://api.spotify.com/v1/search",
        params={"q": q, "type": "track", "limit": limit},
        headers={"Authorization": f"Bearer {token}"},
        timeout=20,
    )
    if r.status_code == 429:
        wait = int(r.headers.get("Retry-After", "2"))
        # Don't sit on multi-hour rate limits; bail so the cron can retry later.
        if wait > max_wait:
            raise RateLimitExceeded(f"Retry-After={wait}s exceeds cap {max_wait}s")
        time.sleep(wait + 1)
        return _search(token, q, limit, max_wait)
    if r.status_code == 401:
        raise PermissionError("token expired")
    r.raise_for_status()
    return (r.json().get("tracks") or {}).get("items") or []


def find_track(
    token: str, artist: str, track: str, album: str | None = None
) -> tuple[dict | None, str]:
    """Search Spotify with progressively looser queries. Returns (hit, token_used)."""
    queries: list[str] = []
    if album:
        queries.append(f'track:"{track}" artist:"{artist}" album:"{album}"')
    queries.append(f'track:"{track}" artist:"{artist}"')
    queries.append(f'{track} {artist}')

    best: tuple[float, dict] | None = None
    for q in queries:
        try:
            cands = _search(token, q)
        except PermissionError:
            token = _spotify_token()
            cands = _search(token, q)
        for c in cands:
            s = _score(c, artist, track)
            if best is None or s > best[0]:
                best = (s, c)
        if best and best[0] >= 92:
            break
    if best and best[0] >= GOOD_MATCH:
        return best[1], token
    return None, token


UPDATE_SQL = """
UPDATE {table}
SET spotify_uri = %(uri)s,
    spotify_track = %(spotify_track)s,
    spotify_artist = %(spotify_artist)s,
    spotify_album = %(spotify_album)s,
    cover_url = %(cover_url)s,
    preview_url = %(preview_url)s,
    popularity = %(popularity)s,
    enriched_at = now()
WHERE id = %(id)s
"""


def _fetch_unenriched(conn: psycopg.Connection, table: str, limit: int) -> list[dict]:
    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute(
            f"""
            SELECT id, track, artist, album
            FROM {table}
            WHERE enriched_at IS NULL
            ORDER BY id
            LIMIT %s
            """,
            (limit,),
        )
        return list(cur.fetchall())


def _mark_missing(conn: psycopg.Connection, table: str, ids: list[int]) -> None:
    """Stamp enriched_at on rows where Spotify returned no confident match,
    so we don't keep retrying them on every run."""
    if not ids:
        return
    with conn.cursor() as cur:
        cur.execute(
            f"UPDATE {table} SET enriched_at = now() WHERE id = ANY(%s)",
            (ids,),
        )


def _enrich_table(
    conn: psycopg.Connection,
    token: str,
    table: str,
    batch_size: int,
) -> tuple[int, int, str]:
    rows = _fetch_unenriched(conn, table, batch_size)
    if not rows:
        return 0, 0, token

    hits = 0
    misses: list[int] = []

    with Progress(
        SpinnerColumn(),
        TextColumn(f"[bold]{table}[/bold]"),
        BarColumn(),
        MofNCompleteColumn(),
        TimeElapsedColumn(),
        console=console,
    ) as progress:
        task = progress.add_task(table, total=len(rows))
        for row in rows:
            try:
                hit, token = find_track(token, row["artist"], row["track"], row.get("album"))
            except RateLimitExceeded as ex:
                console.log(f"[yellow]rate-limited, stopping for this run:[/yellow] {ex}")
                _mark_missing(conn, table, misses)
                conn.commit()
                return hits, len(misses), token
            except Exception as ex:
                console.log(f"[yellow]error[/yellow] {row['artist']} - {row['track']}: {ex}")
                hit = None
            if hit:
                cover = None
                images = (hit.get("album") or {}).get("images") or []
                if images:
                    cover = images[0].get("url")
                payload = {
                    "id": row["id"],
                    "uri": hit["uri"],
                    "spotify_track": hit.get("name"),
                    "spotify_artist": ", ".join(a["name"] for a in hit.get("artists", [])),
                    "spotify_album": (hit.get("album") or {}).get("name"),
                    "cover_url": cover,
                    "preview_url": hit.get("preview_url"),
                    "popularity": hit.get("popularity"),
                }
                with conn.cursor() as cur:
                    cur.execute(UPDATE_SQL.format(table=table), payload)
                hits += 1
            else:
                misses.append(row["id"])
            progress.update(task, advance=1)
            if (hits + len(misses)) % 100 == 0:
                _mark_missing(conn, table, misses)
                misses = []
                conn.commit()

    _mark_missing(conn, table, misses)
    conn.commit()
    return hits, len(rows) - hits, token


def enrich_all(batch_size: int = 50000) -> tuple[int, int]:
    """Enrich every un-enriched track in both tables. Returns (hits, misses)."""
    token = _spotify_token()
    total_hits = 0
    total_misses = 0
    with psycopg.connect(_dsn()) as conn:
        with conn.cursor() as cur:
            cur.execute(SCHEMA_SQL.read_text())
        conn.commit()

        for table in ("album_tracks", "singles"):
            while True:
                hits, misses, token = _enrich_table(conn, token, table, batch_size)
                total_hits += hits
                total_misses += misses
                if hits + misses == 0:
                    break

    console.print(f"[green]done[/green] - hits={total_hits} misses={total_misses}")
    return total_hits, total_misses
