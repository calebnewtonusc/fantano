-- Fantano FAV TRACKS database schema.
-- Two tables, one Postgres:
--   album_tracks - songs Fantano flagged as FAV TRACKS within an album review
--                  (carries full album metadata: album, release_year, label, genres)
--   singles      - songs Fantano flagged as BEST in a Weekly Track Roundup
--                  (no album / label / genre context in the source description)

-- ============================================================================
-- album_tracks: one row per (review video, track) pair.
-- ============================================================================
CREATE TABLE IF NOT EXISTS album_tracks (
  id            BIGSERIAL PRIMARY KEY,
  track         TEXT NOT NULL,
  artist        TEXT NOT NULL,
  album         TEXT NOT NULL,
  release_year  INT,
  label         TEXT,
  genres        TEXT[] NOT NULL DEFAULT '{}',
  video_id      TEXT NOT NULL,
  video_title   TEXT,
  video_url     TEXT NOT NULL,
  upload_date   DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS album_tracks_video_track_artist_uidx
  ON album_tracks (video_id, lower(track), lower(artist));

CREATE INDEX IF NOT EXISTS album_tracks_artist_lower_idx ON album_tracks (lower(artist));
CREATE INDEX IF NOT EXISTS album_tracks_album_lower_idx  ON album_tracks (lower(album));
CREATE INDEX IF NOT EXISTS album_tracks_track_lower_idx  ON album_tracks (lower(track));
CREATE INDEX IF NOT EXISTS album_tracks_release_year_idx ON album_tracks (release_year);
CREATE INDEX IF NOT EXISTS album_tracks_label_lower_idx  ON album_tracks (lower(label));
CREATE INDEX IF NOT EXISTS album_tracks_genres_gin_idx   ON album_tracks USING gin (genres);
CREATE INDEX IF NOT EXISTS album_tracks_upload_date_idx  ON album_tracks (upload_date DESC);

-- ============================================================================
-- singles: one row per (roundup video, track) pair.
-- ============================================================================
CREATE TABLE IF NOT EXISTS singles (
  id            BIGSERIAL PRIMARY KEY,
  track         TEXT NOT NULL,
  artist        TEXT NOT NULL,
  release_year  INT,
  video_id      TEXT NOT NULL,
  video_title   TEXT,
  video_url     TEXT NOT NULL,
  upload_date   DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS singles_video_track_artist_uidx
  ON singles (video_id, lower(track), lower(artist));

CREATE INDEX IF NOT EXISTS singles_artist_lower_idx ON singles (lower(artist));
CREATE INDEX IF NOT EXISTS singles_track_lower_idx  ON singles (lower(track));
CREATE INDEX IF NOT EXISTS singles_release_year_idx ON singles (release_year);
CREATE INDEX IF NOT EXISTS singles_upload_date_idx  ON singles (upload_date DESC);

-- ============================================================================
-- Auto-bump updated_at on UPDATE for both tables.
-- ============================================================================
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS album_tracks_set_updated_at ON album_tracks;
CREATE TRIGGER album_tracks_set_updated_at
  BEFORE UPDATE ON album_tracks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS singles_set_updated_at ON singles;
CREATE TRIGGER singles_set_updated_at
  BEFORE UPDATE ON singles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
