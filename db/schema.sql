-- Fantano FAV TRACKS database schema.
-- Source of truth: every track Anthony Fantano has called a FAV TRACK
-- across album/EP/mixtape/track reviews + best tracks from Weekly Track Roundups.

CREATE TABLE IF NOT EXISTS tracks (
  id            BIGSERIAL PRIMARY KEY,
  track         TEXT NOT NULL,
  artist        TEXT NOT NULL,
  album         TEXT,
  release_year  INT,
  label         TEXT,
  genres        TEXT[] NOT NULL DEFAULT '{}',
  source        TEXT NOT NULL CHECK (source IN ('review', 'roundup')),
  video_id      TEXT NOT NULL,
  video_title   TEXT,
  video_url     TEXT NOT NULL,
  upload_date   DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dedup key: one row per (track, artist) within a video.
CREATE UNIQUE INDEX IF NOT EXISTS tracks_video_track_artist_uidx
  ON tracks (video_id, lower(track), lower(artist));

-- Indexes for the search filters the AI endpoint will hit.
CREATE INDEX IF NOT EXISTS tracks_artist_lower_idx ON tracks (lower(artist));
CREATE INDEX IF NOT EXISTS tracks_track_lower_idx  ON tracks (lower(track));
CREATE INDEX IF NOT EXISTS tracks_release_year_idx ON tracks (release_year);
CREATE INDEX IF NOT EXISTS tracks_genres_gin_idx   ON tracks USING gin (genres);
CREATE INDEX IF NOT EXISTS tracks_upload_date_idx  ON tracks (upload_date DESC);
CREATE INDEX IF NOT EXISTS tracks_source_idx       ON tracks (source);

-- Auto-bump updated_at on UPDATE.
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tracks_set_updated_at ON tracks;
CREATE TRIGGER tracks_set_updated_at
  BEFORE UPDATE ON tracks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
