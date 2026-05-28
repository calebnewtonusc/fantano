import { Pool } from "pg";
import type { Track, TrackSource, SearchFilter } from "./types";

declare global {
  var __fantanoPool: Pool | undefined;
}

function getPool(): Pool {
  if (!global.__fantanoPool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set");
    }
    global.__fantanoPool = new Pool({
      connectionString,
      max: 5,
      ssl: connectionString.includes("sslmode=require")
        ? { rejectUnauthorized: false }
        : undefined,
    });
  }
  return global.__fantanoPool;
}

interface AlbumRow {
  id: string;
  track: string;
  artist: string;
  album: string;
  release_year: number | null;
  label: string | null;
  genres: string[];
  video_id: string;
  video_title: string | null;
  video_url: string;
  upload_date: string | null;
}

interface SingleRow {
  id: string;
  track: string;
  artist: string;
  release_year: number | null;
  video_id: string;
  video_title: string | null;
  video_url: string;
  upload_date: string | null;
}

interface SearchSqlResult {
  rows: Track[];
  total: number;
}

interface BuiltClause {
  where: string;
  params: unknown[];
}

/**
 * Decide which underlying tables we should hit based on the filter.
 * - genres present, no source override -> album_tracks only (singles have no genres)
 * - label_contains or album_contains -> album_tracks only
 * - source = 'single' -> singles only
 * - source = 'album' -> album_tracks only
 * - otherwise -> both
 */
function pickSources(filter: SearchFilter): TrackSource[] {
  if (filter.source === "album") return ["album"];
  if (filter.source === "single") return ["single"];
  const hasAlbumOnlyFields =
    (filter.genres && filter.genres.length > 0) ||
    !!filter.label_contains ||
    !!filter.album_contains;
  if (hasAlbumOnlyFields) return ["album"];
  return ["album", "single"];
}

function buildAlbumWhere(filter: SearchFilter, startIdx: number): BuiltClause {
  const where: string[] = [];
  const params: unknown[] = [];
  let p = startIdx;

  if (filter.genres && filter.genres.length > 0) {
    where.push(`genres && $${p}::text[]`);
    params.push(filter.genres.map((g) => g.toLowerCase()));
    p++;
  }
  if (typeof filter.year_min === "number") {
    where.push(`release_year >= $${p}`);
    params.push(filter.year_min);
    p++;
  }
  if (typeof filter.year_max === "number") {
    where.push(`release_year <= $${p}`);
    params.push(filter.year_max);
    p++;
  }
  if (filter.artist_contains) {
    where.push(`lower(artist) LIKE '%' || lower($${p}) || '%'`);
    params.push(filter.artist_contains);
    p++;
  }
  if (filter.album_contains) {
    where.push(`lower(album) LIKE '%' || lower($${p}) || '%'`);
    params.push(filter.album_contains);
    p++;
  }
  if (filter.label_contains) {
    where.push(`lower(label) LIKE '%' || lower($${p}) || '%'`);
    params.push(filter.label_contains);
    p++;
  }

  return {
    where: where.length > 0 ? `WHERE ${where.join(" AND ")}` : "",
    params,
  };
}

function buildSingleWhere(filter: SearchFilter, startIdx: number): BuiltClause {
  const where: string[] = [];
  const params: unknown[] = [];
  let p = startIdx;

  if (typeof filter.year_min === "number") {
    where.push(`release_year >= $${p}`);
    params.push(filter.year_min);
    p++;
  }
  if (typeof filter.year_max === "number") {
    where.push(`release_year <= $${p}`);
    params.push(filter.year_max);
    p++;
  }
  if (filter.artist_contains) {
    where.push(`lower(artist) LIKE '%' || lower($${p}) || '%'`);
    params.push(filter.artist_contains);
    p++;
  }
  return {
    where: where.length > 0 ? `WHERE ${where.join(" AND ")}` : "",
    params,
  };
}

function orderClause(orderBy: SearchFilter["order_by"]): string {
  switch (orderBy) {
    case "release_year_asc":
      return "ORDER BY release_year ASC NULLS LAST, upload_date DESC NULLS LAST";
    case "upload_date_desc":
      return "ORDER BY upload_date DESC NULLS LAST";
    case "random":
      return "ORDER BY random()";
    case "release_year_desc":
    default:
      return "ORDER BY release_year DESC NULLS LAST, upload_date DESC NULLS LAST";
  }
}

export async function searchTracks(
  filter: SearchFilter,
): Promise<SearchSqlResult> {
  const pool = getPool();
  const sources = pickSources(filter);
  const limit = Math.min(Math.max(filter.limit ?? 50, 1), 500);
  const order = orderClause(filter.order_by);

  // Both tables: UNION ALL with computed source label + uid.
  if (sources.length === 2) {
    const albumClause = buildAlbumWhere(filter, 1);
    const singleClause = buildSingleWhere(
      filter,
      1 + albumClause.params.length,
    );
    const params = [...albumClause.params, ...singleClause.params];

    const sql = `
      WITH q_albums AS (
        SELECT 'a-' || id AS uid, 'album'::text AS source,
               track, artist, album, release_year, label, genres,
               video_id, video_title, video_url, upload_date
        FROM album_tracks
        ${albumClause.where}
      ),
      q_singles AS (
        SELECT 's-' || id AS uid, 'single'::text AS source,
               track, artist, NULL::text AS album, release_year,
               NULL::text AS label, ARRAY[]::text[] AS genres,
               video_id, video_title, video_url, upload_date
        FROM singles
        ${singleClause.where}
      ),
      merged AS (
        SELECT * FROM q_albums
        UNION ALL
        SELECT * FROM q_singles
      )
      SELECT * FROM merged
      ${order}
      LIMIT ${limit}
    `;
    const countSql = `
      SELECT
        (SELECT count(*)::int FROM album_tracks ${albumClause.where})
      + (SELECT count(*)::int FROM singles      ${singleClause.where})
      AS n
    `;
    const [results, totals] = await Promise.all([
      pool.query<Track>(sql, params),
      pool.query<{ n: number }>(countSql, params),
    ]);
    return { rows: results.rows, total: totals.rows[0]?.n ?? 0 };
  }

  // Album-only
  if (sources[0] === "album") {
    const { where, params } = buildAlbumWhere(filter, 1);
    const sql = `
      SELECT 'a-' || id AS uid, 'album'::text AS source,
             track, artist, album, release_year, label, genres,
             video_id, video_title, video_url, upload_date
      FROM album_tracks
      ${where}
      ${order}
      LIMIT ${limit}
    `;
    const countSql = `SELECT count(*)::int AS n FROM album_tracks ${where}`;
    const [results, totals] = await Promise.all([
      pool.query<Track>(sql, params),
      pool.query<{ n: number }>(countSql, params),
    ]);
    return { rows: results.rows, total: totals.rows[0]?.n ?? 0 };
  }

  // Singles-only
  const { where, params } = buildSingleWhere(filter, 1);
  const sql = `
    SELECT 's-' || id AS uid, 'single'::text AS source,
           track, artist, NULL::text AS album, release_year,
           NULL::text AS label, ARRAY[]::text[] AS genres,
           video_id, video_title, video_url, upload_date
    FROM singles
    ${where}
    ${order}
    LIMIT ${limit}
  `;
  const countSql = `SELECT count(*)::int AS n FROM singles ${where}`;
  const [results, totals] = await Promise.all([
    pool.query<Track>(sql, params),
    pool.query<{ n: number }>(countSql, params),
  ]);
  return { rows: results.rows, total: totals.rows[0]?.n ?? 0 };
}

export async function getGenreVocabulary(limit = 200): Promise<string[]> {
  const pool = getPool();
  const result = await pool.query<{ genre: string }>(
    `
    SELECT unnest(genres) AS genre, count(*)::int AS n
    FROM album_tracks
    GROUP BY genre
    ORDER BY n DESC
    LIMIT $1
    `,
    [limit],
  );
  return result.rows.map((r) => r.genre);
}

export async function getStats(): Promise<{
  totalTracks: number;
  totalAlbums: number;
  totalSingles: number;
  totalArtists: number;
  earliestYear: number | null;
  latestYear: number | null;
}> {
  const pool = getPool();
  const result = await pool.query<{
    total_album_tracks: number;
    total_singles: number;
    total_albums: number;
    total_artists: number;
    earliest_year: number | null;
    latest_year: number | null;
  }>(
    `
    SELECT
      (SELECT count(*)::int FROM album_tracks)                         AS total_album_tracks,
      (SELECT count(*)::int FROM singles)                              AS total_singles,
      (SELECT count(DISTINCT lower(album))::int FROM album_tracks)     AS total_albums,
      (SELECT count(*)::int FROM (
         SELECT lower(artist) FROM album_tracks
         UNION
         SELECT lower(artist) FROM singles
       ) u)                                                            AS total_artists,
      (SELECT min(year) FROM (
         SELECT release_year AS year FROM album_tracks
         UNION ALL
         SELECT release_year FROM singles
       ) y)                                                            AS earliest_year,
      (SELECT max(year) FROM (
         SELECT release_year AS year FROM album_tracks
         UNION ALL
         SELECT release_year FROM singles
       ) y)                                                            AS latest_year
    `,
  );
  const row = result.rows[0];
  return {
    totalTracks: (row?.total_album_tracks ?? 0) + (row?.total_singles ?? 0),
    totalAlbums: row?.total_albums ?? 0,
    totalSingles: row?.total_singles ?? 0,
    totalArtists: row?.total_artists ?? 0,
    earliestYear: row?.earliest_year ?? null,
    latestYear: row?.latest_year ?? null,
  };
}

// AlbumRow / SingleRow types remain for future direct queries that need
// the table-specific shape rather than the unified Track shape.
export type { AlbumRow, SingleRow };
