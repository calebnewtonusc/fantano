"""fantano CLI - drives the full pipeline."""
from __future__ import annotations

import os

import typer
from dotenv import load_dotenv
from rich.console import Console

from . import export as export_mod
from . import fetch as fetch_mod
from . import parse as parse_mod
from . import spotify as spotify_mod
from . import sync as sync_mod

console = Console()
app = typer.Typer(no_args_is_help=True, add_completion=False, help=__doc__)


@app.command()
def fetch(
    limit: int | None = typer.Option(None, help="Cap on videos pulled from the channel listing."),
    reviews_only: bool = typer.Option(False, help="Skip Weekly Track Roundups - only scrape album/track reviews."),
    roundups_only: bool = typer.Option(False, help="Only scrape Weekly Track Roundups."),
):
    """Scrape Anthony Fantano's channel: list videos, filter, fetch descriptions + chapters."""
    load_dotenv()
    url = os.getenv("FANTANO_CHANNEL_URL", "https://www.youtube.com/theneedledrop")
    if reviews_only and roundups_only:
        raise typer.BadParameter("Use one of --reviews-only / --roundups-only, not both.")
    if reviews_only:
        kinds: tuple[str, ...] = ("review",)
    elif roundups_only:
        kinds = ("roundup",)
    else:
        kinds = ("review", "roundup")
    fetch_mod.scrape_channel(url, limit=limit, kinds=kinds)


@app.command()
def parse():
    """Parse cached videos: extract FAV TRACKS (reviews) and best tracks (roundups)."""
    parse_mod.parse_all()


@app.command()
def csv():
    """Export every parsed (artist, track) tuple to tracks.csv for import into Spotify."""
    export_mod.export_csv()


@app.command()
def sync():
    """Upsert every parsed track into Postgres (DATABASE_URL from .env)."""
    sync_mod.sync_all()


@app.command()
def match():
    """Search Spotify for every parsed track and cache the URIs."""
    spotify_mod.match_all()


@app.command()
def build():
    """Create or update the Spotify playlist with all matched tracks."""
    spotify_mod.build_playlist()


@app.command()
def run(
    limit: int | None = typer.Option(None, help="Cap on videos (useful for first runs)."),
    skip_sync: bool = typer.Option(False, help="Skip Postgres sync (export CSV instead)."),
):
    """Production pipeline: fetch -> parse -> sync to Postgres.

    Use --skip-sync to fall back to local CSV export instead of DB sync
    (e.g. on a dev box without DATABASE_URL).
    """
    load_dotenv()
    url = os.getenv("FANTANO_CHANNEL_URL", "https://www.youtube.com/theneedledrop")
    fetch_mod.scrape_channel(url, limit=limit)
    parse_mod.parse_all()
    if skip_sync:
        export_mod.export_csv()
    else:
        sync_mod.sync_all()


@app.command()
def stats():
    """Print quick counts from the cached pipeline state."""
    import json

    from .paths import MATCHES_JSON, PARSED_JSON, UNMATCHED_JSON, VIDEOS_JSON

    if VIDEOS_JSON.exists():
        v = json.loads(VIDEOS_JSON.read_text())
        kinds: dict[str, int] = {}
        for entry in v.values():
            k = entry.get("kind") or "?"
            kinds[k] = kinds.get(k, 0) + 1
        console.print(f"videos: [cyan]{len(v)}[/cyan] {kinds}")
    if PARSED_JSON.exists():
        p = json.loads(PARSED_JSON.read_text())
        tracks = sum(len(r["tracks"]) for r in p)
        console.print(f"parsed: [cyan]{len(p)}[/cyan] videos, [cyan]{tracks}[/cyan] tracks")
    if MATCHES_JSON.exists():
        m = json.loads(MATCHES_JSON.read_text())
        hits = sum(1 for v in m.values() if v.get("uri"))
        console.print(f"matched: [green]{hits}[/green] / [cyan]{len(m)}[/cyan] tracks")
    if UNMATCHED_JSON.exists():
        u = json.loads(UNMATCHED_JSON.read_text())
        console.print(f"unmatched: [yellow]{len(u)}[/yellow] (see data/unmatched.json)")


if __name__ == "__main__":
    app()
