"""Parse Fantano review video metadata: extract artist/album from title, FAV TRACKS from description."""
from __future__ import annotations

import json
import re
from typing import Iterable

from rich.console import Console

from .paths import PARSED_JSON, VIDEOS_JSON

console = Console()

REVIEW_TAG_RE = re.compile(
    r"\s*(NOT GOOD\s+|MEDIOCRE\s+|CLASSIC\s+)?(ALBUM|EP|MIXTAPE|TRACK|COMPILATION)\s+REVIEW\s*$",
    re.IGNORECASE,
)

FAV_BLOCK_RE = re.compile(
    r"FAV\s+TRACKS?\s*[:\-]\s*([^\n]+)",
    re.IGNORECASE,
)

# Fantano's metadata tag line, e.g.:
#   BLADEE - SULFUR SURFER / 2026 / TRASH ISLAND / CLOUD RAP, EXPERIMENTAL HIP HOP, PSYCH FOLK
# Split on ` / ` -> [artist - album, year, label, genres-csv].
TAG_LINE_RE = re.compile(
    r"^[^/\n]+?\s+-\s+[^/\n]+?\s+/\s+(\d{4})\s+/\s+([^/\n]+?)\s+/\s+([^\n]+)$",
    re.MULTILINE,
)

SKIP_VALUES = {
    "", "n/a", "na", "none", "tbd", "all of em", "all of them",
    "everything", "every track", "all", "the whole thing",
}

# Roundup chapter parsing
BEST_TIER_RE = re.compile(r"\b(BEST|PLATINUM|GOLD|STRONG|HIGHLIGHT|FAV|FAVORITE)\b", re.IGNORECASE)
WORST_TIER_RE = re.compile(r"\b(WORST|WEAK|TRASH|NOT\s+GOOD|BOTTOM|LOW)\b", re.IGNORECASE)
SKIP_CHAPTER_RE = re.compile(r"\b(INTRO|OUTRO|HONORABLE|MENTIONS?|TIMESTAMP|SPONSOR|END|RECAP)\b", re.IGNORECASE)

# Roundup description parsing
BEST_HEADER_RE = re.compile(
    r"(?:!{1,}\s*)?(?:BEST\s+TRACKS?(?:\s+THIS\s+WEEK)?|HIGHLIGHTS?|FAV\s+TRACKS?(?:\s+THIS\s+WEEK)?|TOP\s+TRACKS?)(?:\s*!{1,})?\s*:?\s*\n",
    re.IGNORECASE,
)
BEST_STOPPER_RE = re.compile(
    r"\n\s*(?:!{1,}\s*)?[\.…]*\s*(?:MEH(?:\s+TRACKS?)?|WORST(?:\s+TRACKS?)?(?:\s+THIS\s+WEEK)?|WEAK(?:\s+TRACKS?)?|BOTTOM|TRASH|NOT\s+GOOD|LOW|FOLLOW\s+ME|PATREON)",
    re.IGNORECASE,
)
URL_LINE_RE = re.compile(r"^\s*https?://", re.IGNORECASE)


def clean_title(title: str) -> tuple[str | None, str | None]:
    """Pull artist + album/track out of a Fantano review title.

    Format is usually: ``Artist - Album ALBUM REVIEW`` (or EP/MIXTAPE/TRACK).
    """
    if not title:
        return None, None
    stripped = REVIEW_TAG_RE.sub("", title).strip()
    # Normalize the various dashes Fantano uses.
    for sep in (" - ", " – ", " — "):
        if sep in stripped:
            artist, album = stripped.split(sep, 1)
            return artist.strip(" \"'"), album.strip(" \"'")
    return None, stripped.strip(" \"'") or None


def parse_fav_tracks(description: str) -> list[str]:
    """Extract the comma-separated FAV TRACKS list from a Fantano video description."""
    if not description:
        return []
    m = FAV_BLOCK_RE.search(description)
    if not m:
        return []
    block = m.group(1)
    # Cut at the first newline followed by another label (LEAST FAV, Y'all, etc.).
    block = re.split(r"\n\s*(?:LEAST|Y'ALL|YOU CAN|FOLLOW|LISTEN|BUY|http)", block, maxsplit=1, flags=re.IGNORECASE)[0]
    # Split on commas and the word "and" (slashes are real characters in some track titles).
    raw = re.split(r",| and ", block)
    out: list[str] = []
    seen: set[str] = set()
    for piece in raw:
        t = piece.strip().strip(" .\"'").strip()
        if not t:
            continue
        if t.lower() in SKIP_VALUES:
            continue
        # Trim trailing junk like " (feat. X)" → keep, but kill stray quotes.
        t = re.sub(r"\s+", " ", t)
        key = t.lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(t)
    return out


def _split_artist_track(line: str) -> tuple[str, str] | None:
    """Parse a 'Artist - Track' line (used in roundup chapters and descriptions)."""
    s = re.sub(r"^\s*[\d]+[\.\)]\s*", "", line).strip(" .\"'\t-")
    if not s:
        return None
    for sep in (" - ", " – ", " — "):
        if sep in s:
            artist, track = s.split(sep, 1)
            artist = artist.strip(" \"'")
            track = track.strip(" \"'")
            if artist and track and len(artist) < 120 and len(track) < 200:
                return artist, track
    return None


def parse_roundup_best_tracks(video: dict) -> list[tuple[str, str]]:
    """Pull (artist, track) pairs labelled best/highlight from a Weekly Track Roundup."""
    out: list[tuple[str, str]] = []
    seen: set[str] = set()

    chapters = video.get("chapters") or []
    if chapters:
        in_best = False
        any_tier_seen = False
        for ch in chapters:
            title = (ch.get("title") or "").strip()
            if not title:
                continue
            if BEST_TIER_RE.search(title):
                in_best = True
                any_tier_seen = True
            if WORST_TIER_RE.search(title):
                in_best = False
                any_tier_seen = True
            if SKIP_CHAPTER_RE.search(title):
                continue
            # Strip tier prefix to leave just "Artist - Track".
            cleaned = BEST_TIER_RE.sub("", title)
            cleaned = WORST_TIER_RE.sub("", cleaned)
            cleaned = re.sub(r"^[\s\-:|/]+", "", cleaned).strip(" .\"'-")
            include = in_best if any_tier_seen else True  # no explicit tiers → keep all tracks
            if include:
                pair = _split_artist_track(cleaned)
                if pair:
                    key = f"{pair[0].lower()}|{pair[1].lower()}"
                    if key not in seen:
                        seen.add(key)
                        out.append(pair)
        if out:
            return out

    # Fallback: description block scan.
    desc = video.get("description") or ""
    hdr = BEST_HEADER_RE.search(desc)
    if not hdr:
        return []
    start = hdr.end()
    stop = BEST_STOPPER_RE.search(desc, start)
    block = desc[start: stop.start() if stop else len(desc)]
    for line in block.splitlines():
        if not line.strip() or URL_LINE_RE.match(line):
            continue
        pair = _split_artist_track(line)
        if pair:
            key = f"{pair[0].lower()}|{pair[1].lower()}"
            if key not in seen:
                seen.add(key)
                out.append(pair)
    return out


def parse_tag_line(description: str) -> dict:
    """Extract release_year, label, and genre tags from Fantano's slash-delimited tag line."""
    if not description:
        return {}
    m = TAG_LINE_RE.search(description)
    if not m:
        return {}
    year_str, label, genres_csv = m.group(1), m.group(2), m.group(3)
    try:
        release_year = int(year_str)
    except ValueError:
        release_year = None
    label_clean = label.strip().lower()
    if label_clean in {"self-released", "self released", "selfreleased"}:
        label_clean = "self-released"
    genres = [g.strip().lower() for g in genres_csv.split(",") if g.strip()]
    return {
        "release_year": release_year,
        "label": label_clean,
        "genres": genres,
    }


def parse_video(video: dict) -> dict | None:
    """Return parsed record for one video, or None if nothing usable was found."""
    kind = video.get("kind")
    if kind == "roundup":
        pairs = parse_roundup_best_tracks(video)
        if not pairs:
            return None
        upload_year = None
        ud = video.get("upload_date")
        if ud and len(ud) >= 4 and ud[:4].isdigit():
            upload_year = int(ud[:4])
        return {
            "video_id": video.get("id"),
            "title": video.get("title"),
            "url": video.get("url"),
            "upload_date": video.get("upload_date"),
            "kind": "roundup",
            "release_year": upload_year,
            "label": None,
            "genres": [],
            "tracks": [
                {
                    "artist": a,
                    "track": t,
                    "album": None,
                    "release_year": upload_year,
                    "label": None,
                    "genres": [],
                }
                for a, t in pairs
            ],
        }

    artist, album = clean_title(video.get("title", ""))
    favs = parse_fav_tracks(video.get("description", ""))
    if not favs or not artist:
        return None
    meta = parse_tag_line(video.get("description", ""))
    return {
        "video_id": video.get("id"),
        "title": video.get("title"),
        "url": video.get("url"),
        "upload_date": video.get("upload_date"),
        "kind": "review",
        "artist": artist,
        "album": album,
        "release_year": meta.get("release_year"),
        "label": meta.get("label"),
        "genres": meta.get("genres") or [],
        "tracks": [
            {
                "artist": artist,
                "track": t,
                "album": album,
                "release_year": meta.get("release_year"),
                "label": meta.get("label"),
                "genres": meta.get("genres") or [],
            }
            for t in favs
        ],
    }


def parse_all() -> list[dict]:
    """Parse every cached video, write parsed.json, return list of records."""
    if not VIDEOS_JSON.exists():
        raise SystemExit("data/videos.json not found. Run `fantano fetch` first.")
    videos: dict[str, dict] = json.loads(VIDEOS_JSON.read_text())
    records: list[dict] = []
    skipped = 0
    for v in videos.values():
        rec = parse_video(v)
        if rec:
            records.append(rec)
        else:
            skipped += 1
    PARSED_JSON.write_text(json.dumps(records, indent=2, ensure_ascii=False))
    total_tracks = sum(len(r["tracks"]) for r in records)
    by_kind = {k: sum(1 for r in records if r["kind"] == k) for k in {r["kind"] for r in records}}
    console.print(
        f"parsed [cyan]{len(records)}[/cyan] videos {by_kind} "
        f"-> [cyan]{total_tracks}[/cyan] candidate tracks "
        f"(skipped [yellow]{skipped}[/yellow] with nothing usable)"
    )
    return records
