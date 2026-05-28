"""Upsert parsed Fantano tracks into Postgres."""
from __future__ import annotations

import json
import os
from pathlib import Path

import psycopg
from dotenv import load_dotenv
from psycopg.rows import dict_row
from rich.console import Console
from rich.progress import BarColumn, MofNCompleteColumn, Progress, TimeElapsedColumn

from .paths import PARSED_JSON, ROOT

console = Console()

SCHEMA_SQL = ROOT / "db" / "schema.sql"

UPSERT_SQL = """
INSERT INTO tracks (
    track, artist, album, release_year, label, genres,
    source, video_id, video_title, video_url, upload_date
) VALUES (
    %(track)s, %(artist)s, %(album)s, %(release_year)s, %(label)s, %(genres)s,
    %(source)s, %(video_id)s, %(video_title)s, %(video_url)s, %(upload_date)s
)
ON CONFLICT (video_id, lower(track), lower(artist))
DO UPDATE SET
    album = EXCLUDED.album,
    release_year = EXCLUDED.release_year,
    label = EXCLUDED.label,
    genres = EXCLUDED.genres,
    source = EXCLUDED.source,
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


def _flatten(records: list[dict]) -> list[dict]:
    rows: list[dict] = []
    seen: set[tuple[str, str, str]] = set()
    for rec in records:
        for t in rec["tracks"]:
            artist = (t.get("artist") or "").strip()
            track = (t.get("track") or "").strip()
            if not artist or not track:
                continue
            key = (rec["video_id"], track.lower(), artist.lower())
            if key in seen:
                continue
            seen.add(key)
            rows.append({
                "track": track,
                "artist": artist,
                "album": (t.get("album") or "").strip() or None,
                "release_year": t.get("release_year"),
                "label": (t.get("label") or "").strip() or None,
                "genres": list(t.get("genres") or []),
                "source": rec.get("kind") or "review",
                "video_id": rec["video_id"],
                "video_title": rec.get("title"),
                "video_url": rec["url"],
                "upload_date": _parse_date(rec.get("upload_date")),
            })
    return rows


def sync_all() -> int:
    """Read parsed.json and upsert every track into Postgres. Returns rows synced."""
    if not PARSED_JSON.exists():
        raise SystemExit("data/parsed.json not found. Run `fantano parse` first.")
    records: list[dict] = json.loads(PARSED_JSON.read_text())
    rows = _flatten(records)
    console.print(f"upserting [cyan]{len(rows)}[/cyan] tracks into Postgres")

    with psycopg.connect(_dsn()) as conn:
        ensure_schema(conn)
        with conn.cursor() as cur:
            with Progress(
                BarColumn(),
                MofNCompleteColumn(),
                TimeElapsedColumn(),
                console=console,
            ) as progress:
                task = progress.add_task("upserting", total=len(rows))
                BATCH = 500
                for i in range(0, len(rows), BATCH):
                    chunk = rows[i: i + BATCH]
                    cur.executemany(UPSERT_SQL, chunk)
                    conn.commit()
                    progress.update(task, advance=len(chunk))
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute("SELECT count(*) AS n FROM tracks")
            total = cur.fetchone()["n"]
    console.print(f"[green]done[/green] - tracks table now has {total} rows")
    return len(rows)
