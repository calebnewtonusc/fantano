"""Export parsed Fantano tracks to a CSV ready for isacmlee/csv-to-playlist."""
from __future__ import annotations

import csv
import json

from rich.console import Console

from .paths import PARSED_JSON, TRACKS_CSV

console = Console()


def export_csv() -> int:
    """Flatten data/parsed.json to tracks.csv. Returns count of unique rows written."""
    if not PARSED_JSON.exists():
        raise SystemExit("data/parsed.json not found. Run `fantano fetch` then `fantano parse` first.")
    records: list[dict] = json.loads(PARSED_JSON.read_text())

    rows: list[dict] = []
    seen: set[str] = set()
    for rec in records:
        for t in rec["tracks"]:
            artist = (t.get("artist") or "").strip()
            track = (t.get("track") or "").strip()
            if not artist or not track:
                continue
            key = f"{artist.lower()}|||{track.lower()}"
            if key in seen:
                continue
            seen.add(key)
            rows.append({
                "track": track,
                "artist": artist,
                "album": t.get("album") or "",
                "source": rec.get("kind") or "",
                "video_title": rec.get("title") or "",
                "video_url": rec.get("url") or "",
                "upload_date": rec.get("upload_date") or "",
            })

    with TRACKS_CSV.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["track", "artist", "album", "source", "video_title", "video_url", "upload_date"],
        )
        writer.writeheader()
        writer.writerows(rows)

    console.print(
        f"wrote [green]{len(rows)}[/green] unique (track, artist) rows -> [bold]{TRACKS_CSV}[/bold]"
    )
    return len(rows)
