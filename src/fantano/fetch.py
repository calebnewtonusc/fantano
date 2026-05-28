"""Scrape Anthony Fantano's YouTube channel for review videos + descriptions."""
from __future__ import annotations

import json
import os
import re
from typing import Iterator

from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, MofNCompleteColumn, TimeElapsedColumn
from yt_dlp import YoutubeDL

from .paths import VIDEOS_JSON

console = Console()

REVIEW_TITLE_RE = re.compile(
    r"\b(ALBUM REVIEW|EP REVIEW|MIXTAPE REVIEW|TRACK REVIEW|COMPILATION REVIEW|MEDIOCRE\s+ALBUM\s+REVIEW)\b",
    re.IGNORECASE,
)
ROUNDUP_TITLE_RE = re.compile(
    r"\b(WEEKLY\s+TRACK\s+ROUNDUP|TRACK\s+ROUNDUP|BEST\s+TRACKS\s+OF\s+THE\s+WEEK|WORST\s+TRACKS\s+OF\s+THE\s+WEEK)\b",
    re.IGNORECASE,
)


def _flat_opts() -> dict:
    return {
        "quiet": True,
        "no_warnings": True,
        "extract_flat": True,
        "skip_download": True,
        "ignoreerrors": True,
        "playlistend": None,
    }


def _full_opts() -> dict:
    return {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
        "ignoreerrors": True,
        "extract_flat": False,
        "writesubtitles": False,
        "writeautomaticsub": False,
    }


def list_channel_videos(channel_url: str, limit: int | None = None) -> list[dict]:
    """Flat-list every video on the channel: returns dicts with id, title, url."""
    opts = _flat_opts()
    if limit:
        opts["playlistend"] = limit
    with YoutubeDL(opts) as ydl:
        info = ydl.extract_info(channel_url, download=False)
    entries = info.get("entries") or []
    out: list[dict] = []
    for e in entries:
        if not e:
            continue
        if e.get("_type") == "playlist":
            for sub in e.get("entries") or []:
                if sub:
                    out.append(_flatten(sub))
        else:
            out.append(_flatten(e))
    return out


def _flatten(e: dict) -> dict:
    return {
        "id": e.get("id"),
        "title": e.get("title") or "",
        "url": e.get("url") or f"https://www.youtube.com/watch?v={e.get('id')}",
        "duration": e.get("duration"),
    }


def is_review_title(title: str) -> bool:
    return bool(REVIEW_TITLE_RE.search(title or ""))


def is_roundup_title(title: str) -> bool:
    return bool(ROUNDUP_TITLE_RE.search(title or ""))


def video_kind(title: str) -> str | None:
    if is_review_title(title):
        return "review"
    if is_roundup_title(title):
        return "roundup"
    return None


def fetch_description(video_url: str) -> dict | None:
    """Fetch full metadata (description + upload date) for one video."""
    with YoutubeDL(_full_opts()) as ydl:
        try:
            info = ydl.extract_info(video_url, download=False)
        except Exception as ex:
            console.log(f"[yellow]skip[/yellow] {video_url}: {ex}")
            return None
    if not info:
        return None
    return {
        "id": info.get("id"),
        "title": info.get("title") or "",
        "description": info.get("description") or "",
        "upload_date": info.get("upload_date"),
        "duration": info.get("duration"),
        "url": info.get("webpage_url") or video_url,
        "chapters": info.get("chapters") or [],
    }


def load_cached() -> dict[str, dict]:
    if VIDEOS_JSON.exists():
        return json.loads(VIDEOS_JSON.read_text())
    return {}


def save_cached(cache: dict[str, dict]) -> None:
    VIDEOS_JSON.write_text(json.dumps(cache, indent=2, ensure_ascii=False))


def scrape_channel(
    channel_url: str,
    limit: int | None = None,
    kinds: tuple[str, ...] = ("review", "roundup"),
) -> dict[str, dict]:
    """Full scrape: list channel → filter to selected kinds → fetch descriptions → cache."""
    cache = load_cached()
    console.print(f"[bold]Listing videos on[/bold] {channel_url}")
    flat = list_channel_videos(channel_url, limit=limit)
    console.print(f"  found [cyan]{len(flat)}[/cyan] videos")

    tagged: list[dict] = []
    for v in flat:
        k = video_kind(v["title"])
        if k in kinds:
            v["kind"] = k
            tagged.append(v)
    flat = tagged
    by_kind = {k: sum(1 for v in flat if v["kind"] == k) for k in kinds}
    console.print(f"  matched: {by_kind}")

    todo = [v for v in flat if v["id"] not in cache]
    console.print(f"  [cyan]{len(todo)}[/cyan] need description fetch ({len(flat) - len(todo)} cached)")

    if not todo:
        return cache

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        MofNCompleteColumn(),
        TimeElapsedColumn(),
        console=console,
    ) as progress:
        task = progress.add_task("fetching descriptions", total=len(todo))
        for i, v in enumerate(todo, 1):
            full = fetch_description(v["url"])
            if full:
                full["kind"] = v.get("kind")
                cache[full["id"]] = full
            progress.update(task, advance=1)
            if i % 25 == 0:
                save_cached(cache)
    save_cached(cache)
    return cache
