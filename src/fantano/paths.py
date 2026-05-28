import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

# When deployed, point DATA_DIR at a Railway volume so the videos.json
# cache survives between cron runs.
DATA = Path(os.getenv("DATA_DIR") or (ROOT / "data"))
DATA.mkdir(parents=True, exist_ok=True)

VIDEOS_JSON = DATA / "videos.json"
PARSED_JSON = DATA / "parsed.json"
MATCHES_JSON = DATA / "spotify_matches.json"
UNMATCHED_JSON = DATA / "unmatched.json"
PLAYLIST_STATE_JSON = DATA / "playlist_state.json"
SPOTIPY_CACHE = ROOT / ".spotipy_cache"
TRACKS_CSV = ROOT / "tracks.csv"
