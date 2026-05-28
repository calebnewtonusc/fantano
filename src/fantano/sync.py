"""Upsert parsed Fantano tracks into Postgres.

Reviews go to `album_tracks` (full album metadata).
Roundups go to `singles` (artist + track + release year only).
"""
from __future__ import annotations

import json
import os

import psycopg
from dotenv import load_dotenv
from psycopg.rows import dict_row
from rich.console import Console
from rich.progress import BarColumn, MofNCompleteColumn, Progress, TimeElapsedColumn

from .paths import PARSED_JSON, ROOT

console = Console()

SCHEMA_SQL = ROOT / "db" / "schema.sql"

ALBUM_UPSERT_SQL = """
INSERT INTO album_tracks (
    track, artist, album, release_year, label, genres,
    video_id, video_title, video_url, upload_date
) VALUES (
    %(track)s, %(artist)s, %(album)s, %(release_year)s, %(label)s, %(genres)s,
    %(video_id)s, %(video_title)s, %(video_url)s, %(upload_date)s
)
ON CONFLICT (video_id, lower(track), lower(artist))
DO UPDATE SET
    album = EXCLUDED.album,
    release_year = EXCLUDED.release_year,
    label = EXCLUDED.label,
    genres = EXCLUDED.genres,
    video_title = EXCLUDED.video_title,
    video_url = EXCLUDED.video_url,
    upload_date = EXCLUDED.upload_date
"""

SINGLE_UPSERT_SQL = """
INSERT INTO singles (
    track, artist, release_year,
    video_id, video_title, video_url, upload_date
) VALUES (
    %(track)s, %(artist)s, %(release_year)s,
    %(video_id)s, %(video_title)s, %(video_url)s, %(upload_date)s
)
ON CONFLICT (video_id, lower(track), lower(artist))
DO UPDATE SET
    release_year = EXCLUDED.release_year,
    video_title = EXCLUDED.video_title,
    video_url = EXCLUDED.video_url,
    upload_date = EXCLUDED.upload_date
"""


def _dsn() -> str:
    load_dotenv()
    dsn = os.getenv("DATABASE_URL")
    if not dsn:
        raise SystemExit("Set DATABASE_URL in .env (postgres://user:pass@host:port/dbname).")
    return dsn


def _parse_date(s: str | None) -> str | None:
    """yt-dlp gives upload_date as YYYYMMDD; Postgres wants YYYY-MM-DD."""
    if not s or len(s) != 8 or not s.isdigit():
        return None
    return f"{s[:4]}-{s[4:6]}-{s[6:8]}"


def ensure_schema(conn: psycopg.Connection) -> None:
    if not SCHEMA_SQL.exists():
        raise SystemExit(f"schema file missing: {SCHEMA_SQL}")
    with conn.cursor() as cur:
        cur.execute(SCHEMA_SQL.read_text())
    conn.commit()


def _flatten(records: list[dict]) -> tuple[list[dict], list[dict]]:
    """Return (album_rows, single_rows) ready for executemany."""
    album_rows: list[dict] = []
    single_rows: list[dict] = []
    seen_album: set[tuple[str, str, str]] = set()
    seen_single: set[tuple[str, str, str]] = set()

    for rec in records:
        kind = rec.get("kind")
        for t in rec["tracks"]:
            artist = (t.get("artist") or "").strip()
            track = (t.get("track") or "").strip()
            if not artist or not track:
                continue
            key = (rec["video_id"], track.lower(), artist.lower())

            if kind == "review":
                album = (t.get("album") or "").strip()
                if not album:
                    continue  # album_tracks requires an album
                if key in seen_album:
                    continue
                seen_album.add(key)
                album_rows.append({
                    "track": track,
                    "artist": artist,
                    "album": album,
                    "release_year": t.get("release_year"),
                    "label": (t.get("label") or "").strip() or None,
                    "genres": list(t.get("genres") or []),
                    "video_id": rec["video_id"],
                    "video_title": rec.get("title"),
                    "video_url": rec["url"],
                    "upload_date": _parse_date(rec.get("upload_date")),
                })
            elif kind == "roundup":
                if key in seen_single:
                    continue
                seen_single.add(key)
                single_rows.append({
                    "track": track,
                    "artist": artist,
                    "release_year": t.get("release_year"),
                    "video_id": rec["video_id"],
                    "video_title": rec.get("title"),
                    "video_url": rec["url"],
                    "upload_date": _parse_date(rec.get("upload_date")),
                })
    return album_rows, single_rows


def _batch_upsert(cur: psycopg.Cursor, sql: str, rows: list[dict], label: str) -> None:
    if not rows:
        return
    BATCH = 500
    with Progress(
        BarColumn(),
        MofNCompleteColumn(),
        TimeElapsedColumn(),
        console=console,
    ) as progress:
        task = progress.add_task(label, total=len(rows))
        for i in range(0, len(rows), BATCH):
            chunk = rows[i: i + BATCH]
            cur.executemany(sql, chunk)
            progress.update(task, advance=len(chunk))


def sync_all() -> tuple[int, int]:
    """Upsert every parsed track into Postgres. Returns (album_rows, single_rows)."""
    if not PARSED_JSON.exists():
        raise SystemExit("data/parsed.json not found. Run `fantano parse` first.")
    records: list[dict] = json.loads(PARSED_JSON.read_text())
    album_rows, single_rows = _flatten(records)
    console.print(
        f"upserting [cyan]{len(album_rows)}[/cyan] album tracks + "
        f"[cyan]{len(single_rows)}[/cyan] singles into Postgres"
    )

    with psycopg.connect(_dsn()) as conn:
        ensure_schema(conn)
        with conn.cursor() as cur:
            _batch_upsert(cur, ALBUM_UPSERT_SQL, album_rows, "album_tracks")
            conn.commit()
            _batch_upsert(cur, SINGLE_UPSERT_SQL, single_rows, "singles")
            conn.commit()
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute("SELECT count(*) AS n FROM album_tracks")
            n_albums = cur.fetchone()["n"]
            cur.execute("SELECT count(*) AS n FROM singles")
            n_singles = cur.fetchone()["n"]

    console.print(
        f"[green]done[/green] - album_tracks: {n_albums}, singles: {n_singles}"
    )
    return len(album_rows), len(single_rows)
