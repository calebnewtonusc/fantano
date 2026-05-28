"""Match Fantano FAV TRACKS to Spotify URIs and build the playlist."""
from __future__ import annotations

import json
import os
import time
from typing import Iterable

import spotipy
from dotenv import load_dotenv
from rapidfuzz import fuzz
from rich.console import Console
from rich.progress import BarColumn, MofNCompleteColumn, Progress, SpinnerColumn, TextColumn, TimeElapsedColumn
from spotipy.oauth2 import SpotifyOAuth

from .paths import MATCHES_JSON, PARSED_JSON, PLAYLIST_STATE_JSON, SPOTIPY_CACHE, UNMATCHED_JSON

console = Console()

SCOPES = "playlist-modify-public playlist-modify-private"
GOOD_MATCH_SCORE = 78  # rapidfuzz token_set_ratio threshold


def _client() -> spotipy.Spotify:
    load_dotenv()
    cid = os.getenv("SPOTIFY_CLIENT_ID")
    secret = os.getenv("SPOTIFY_CLIENT_SECRET")
    redirect = os.getenv("SPOTIFY_REDIRECT_URI", "http://127.0.0.1:8888/callback")
    if not cid or not secret:
        raise SystemExit("Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env")
    auth = SpotifyOAuth(
        client_id=cid,
        client_secret=secret,
        redirect_uri=redirect,
        scope=SCOPES,
        cache_path=str(SPOTIPY_CACHE),
        open_browser=True,
    )
    return spotipy.Spotify(auth_manager=auth, requests_timeout=20, retries=3)


def _score(candidate: dict, want_artist: str, want_track: str) -> float:
    cand_artists = " ".join(a["name"] for a in candidate.get("artists", []))
    artist_score = fuzz.token_set_ratio(want_artist.lower(), cand_artists.lower())
    track_score = fuzz.token_set_ratio(want_track.lower(), (candidate.get("name") or "").lower())
    return 0.5 * artist_score + 0.5 * track_score


def _search_once(sp: spotipy.Spotify, query: str, limit: int = 5) -> list[dict]:
    try:
        result = sp.search(q=query, type="track", limit=limit)
    except spotipy.SpotifyException as ex:
        if ex.http_status == 429:
            retry = int(ex.headers.get("Retry-After", "2")) if ex.headers else 2
            time.sleep(retry + 1)
            return _search_once(sp, query, limit)
        console.log(f"[yellow]spotify error[/yellow] {query}: {ex}")
        return []
    return (result.get("tracks") or {}).get("items") or []


def find_track(sp: spotipy.Spotify, artist: str, track: str, album: str | None = None) -> dict | None:
    """Try several search strategies; return the best track dict above threshold."""
    queries: list[str] = []
    if album:
        queries.append(f'track:"{track}" artist:"{artist}" album:"{album}"')
    queries.append(f'track:"{track}" artist:"{artist}"')
    queries.append(f'{track} {artist}')

    best: tuple[float, dict] | None = None
    for q in queries:
        for cand in _search_once(sp, q):
            score = _score(cand, artist, track)
            if best is None or score > best[0]:
                best = (score, cand)
        if best and best[0] >= 92:
            break  # high-confidence hit, stop searching
    if best and best[0] >= GOOD_MATCH_SCORE:
        return best[1]
    return None


def match_all() -> tuple[list[dict], list[dict]]:
    """For every parsed FAV TRACK, find a Spotify URI. Returns (matched, unmatched)."""
    if not PARSED_JSON.exists():
        raise SystemExit("data/parsed.json not found. Run `fantano parse` first.")
    records: list[dict] = json.loads(PARSED_JSON.read_text())

    cache: dict[str, dict] = {}
    if MATCHES_JSON.exists():
        cache = json.loads(MATCHES_JSON.read_text())

    sp = _client()
    matched: list[dict] = []
    unmatched: list[dict] = []

    flat: list[tuple[dict, dict]] = [(r, t) for r in records for t in r["tracks"]]
    console.print(f"matching [cyan]{len(flat)}[/cyan] tracks against Spotify")

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        MofNCompleteColumn(),
        TimeElapsedColumn(),
        console=console,
    ) as progress:
        task = progress.add_task("searching", total=len(flat))
        for i, (rec, t) in enumerate(flat, 1):
            artist = t["artist"]
            track = t["track"]
            album = t.get("album")
            key = f"{artist.lower()}|||{(album or '').lower()}|||{track.lower()}"
            if key in cache:
                entry = cache[key]
            else:
                hit = find_track(sp, artist, track, album)
                if hit:
                    entry = {
                        "uri": hit["uri"],
                        "spotify_artist": ", ".join(a["name"] for a in hit["artists"]),
                        "spotify_track": hit["name"],
                        "spotify_album": (hit.get("album") or {}).get("name"),
                    }
                else:
                    entry = {"uri": None}
                cache[key] = entry

            row = {
                "artist": artist,
                "album": album,
                "track": track,
                "source": rec["kind"],
                "video_id": rec["video_id"],
                "video_url": rec["url"],
                **entry,
            }
            if entry.get("uri"):
                matched.append(row)
            else:
                unmatched.append(row)
            progress.update(task, advance=1)
            if i % 50 == 0:
                MATCHES_JSON.write_text(json.dumps(cache, indent=2, ensure_ascii=False))

    MATCHES_JSON.write_text(json.dumps(cache, indent=2, ensure_ascii=False))
    UNMATCHED_JSON.write_text(json.dumps(unmatched, indent=2, ensure_ascii=False))
    console.print(
        f"matched [green]{len(matched)}[/green] / unmatched [yellow]{len(unmatched)}[/yellow] "
        f"(see data/unmatched.json)"
    )
    return matched, unmatched


def _resolve_user_id(sp: spotipy.Spotify) -> str:
    env_uid = os.getenv("SPOTIFY_USER_ID")
    if env_uid:
        return env_uid
    me = sp.current_user()
    return me["id"]


def _find_playlist(sp: spotipy.Spotify, user_id: str, name: str) -> dict | None:
    offset = 0
    while True:
        page = sp.user_playlists(user_id, limit=50, offset=offset)
        for pl in page["items"]:
            if pl["name"] == name and pl["owner"]["id"] == user_id:
                return pl
        if page.get("next"):
            offset += 50
        else:
            return None


def build_playlist(matched: list[dict] | None = None) -> str:
    """Create or update the Fantano playlist with all matched track URIs. Returns playlist URL."""
    load_dotenv()
    name = os.getenv("PLAYLIST_NAME", "Fantano FAV TRACKS (All Time)")
    description = os.getenv(
        "PLAYLIST_DESCRIPTION",
        "Every track Anthony Fantano has ever listed as a FAV TRACK. Auto-built.",
    )

    if matched is None:
        if not MATCHES_JSON.exists():
            raise SystemExit("data/spotify_matches.json not found. Run `fantano match` first.")
        cache: dict[str, dict] = json.loads(MATCHES_JSON.read_text())
        matched = [v for v in cache.values() if v.get("uri")]

    sp = _client()
    user_id = _resolve_user_id(sp)
    pl = _find_playlist(sp, user_id, name)
    if pl is None:
        pl = sp.user_playlist_create(user=user_id, name=name, public=True, description=description)
        console.print(f"created playlist [bold]{name}[/bold]")
    else:
        console.print(f"updating existing playlist [bold]{name}[/bold]")

    playlist_id = pl["id"]

    # Dedupe URIs, preserving first-occurrence order.
    seen: set[str] = set()
    ordered_uris: list[str] = []
    for row in matched:
        uri = row.get("uri") if isinstance(row, dict) else row
        if uri and uri not in seen:
            seen.add(uri)
            ordered_uris.append(uri)

    # Pull existing playlist URIs so we only add new ones.
    existing: set[str] = set()
    offset = 0
    while True:
        page = sp.playlist_items(playlist_id, limit=100, offset=offset, fields="items.track.uri,next")
        for item in page.get("items") or []:
            t = (item or {}).get("track") or {}
            if t.get("uri"):
                existing.add(t["uri"])
        if page.get("next"):
            offset += 100
        else:
            break

    to_add = [u for u in ordered_uris if u not in existing]
    console.print(
        f"playlist has [cyan]{len(existing)}[/cyan] tracks, "
        f"adding [green]{len(to_add)}[/green] new"
    )

    for chunk_start in range(0, len(to_add), 100):
        chunk = to_add[chunk_start: chunk_start + 100]
        sp.playlist_add_items(playlist_id, chunk)

    url = pl.get("external_urls", {}).get("spotify") or f"https://open.spotify.com/playlist/{playlist_id}"
    PLAYLIST_STATE_JSON.write_text(json.dumps({
        "playlist_id": playlist_id,
        "playlist_url": url,
        "name": name,
        "track_count": len(existing) + len(to_add),
    }, indent=2))
    console.print(f"[bold green]done[/bold green] -> {url}")
    return url
