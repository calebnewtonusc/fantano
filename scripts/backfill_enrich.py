"""One-off: backfill Spotify enrichment against the live (public-proxy) DB.

Runs the same enrich_all() the worker cron uses, but pointed at the Railway
Postgres public proxy so we don't have to wait for the daily cron. Throttled
via SPOTIFY_THROTTLE_SECONDS so it never trips the rate-limit penalty box.
"""
import os
import sys

# Ensure src/ is importable when run from repo root.
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from fantano import enrich  # noqa: E402

if __name__ == "__main__":
    hits, misses = enrich.enrich_all()
    print(f"BACKFILL DONE hits={hits} misses={misses}", flush=True)
