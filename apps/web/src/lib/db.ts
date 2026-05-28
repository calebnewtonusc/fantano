import { Pool } from "pg";
import type { Track, SearchFilter } from "./types";

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

interface SearchSqlResult {
  rows: Track[];
  total: number;
}

export async function searchTracks(
  filter: SearchFilter,
): Promise<SearchSqlResult> {
  const where: string[] = [];
  const params: unknown[] = [];
  let p = 1;

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
  if (filter.source) {
    where.push(`source = $${p}`);
    params.push(filter.source);
    p++;
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

  let orderSql: string;
  switch (filter.order_by) {
    case "release_year_asc":
      orderSql = "ORDER BY release_year ASC NULLS LAST, upload_date DESC";
      break;
    case "upload_date_desc":
      orderSql = "ORDER BY upload_date DESC NULLS LAST";
      break;
    case "random":
      orderSql = "ORDER BY random()";
      break;
    case "release_year_desc":
    default:
      orderSql = "ORDER BY release_year DESC NULLS LAST, upload_date DESC";
  }

  const limit = Math.min(Math.max(filter.limit ?? 50, 1), 500);

  const sql = `
    SELECT
      id, track, artist, album, release_year, label, genres,
      source, video_id, video_title, video_url, upload_date
    FROM tracks
    ${whereSql}
    ${orderSql}
    LIMIT ${limit}
  `;

  const countSql = `SELECT count(*)::int AS n FROM tracks ${whereSql}`;

  const pool = getPool();
  const [results, totalResult] = await Promise.all([
    pool.query<Track>(sql, params),
    pool.query<{ n: number }>(countSql, params),
  ]);

  return {
    rows: results.rows,
    total: totalResult.rows[0]?.n ?? 0,
  };
}

export async function getGenreVocabulary(limit = 200): Promise<string[]> {
  const pool = getPool();
  const result = await pool.query<{ genre: string; n: number }>(
    `
    SELECT unnest(genres) AS genre, count(*)::int AS n
    FROM tracks
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
  totalArtists: number;
  totalAlbums: number;
  earliestYear: number | null;
  latestYear: number | null;
}> {
  const pool = getPool();
  const result = await pool.query<{
    total_tracks: number;
    total_artists: number;
    total_albums: number;
    earliest_year: number | null;
    latest_year: number | null;
  }>(
    `
    SELECT
      count(*)::int                              AS total_tracks,
      count(DISTINCT lower(artist))::int         AS total_artists,
      count(DISTINCT lower(album))::int          AS total_albums,
      min(release_year)                          AS earliest_year,
      max(release_year)                          AS latest_year
    FROM tracks
    `,
  );
  const row = result.rows[0];
  return {
    totalTracks: row?.total_tracks ?? 0,
    totalArtists: row?.total_artists ?? 0,
    totalAlbums: row?.total_albums ?? 0,
    earliestYear: row?.earliest_year ?? null,
    latestYear: row?.latest_year ?? null,
  };
}
