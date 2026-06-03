/**
 * Spotify OAuth: authorization-code flow (no PKCE since we hold the secret on
 * the server). Tokens are stashed in HTTP-only cookies.
 */
import { cookies } from "next/headers";

const SCOPES = ["playlist-modify-public", "playlist-modify-private"].join(" ");
const COOKIE_NAME = "fantano_spotify_access";
const COOKIE_TTL_SECONDS = 60 * 50; // tokens live 60min; refresh at 50.

function envOrThrow(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} not set`);
  return v;
}

export function buildAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: envOrThrow("SPOTIFY_CLIENT_ID"),
    scope: SCOPES,
    redirect_uri: envOrThrow("SPOTIFY_REDIRECT_URI"),
    state,
    // Always show the account/consent screen so a user can switch accounts or
    // re-grant after we've rotated the underlying Spotify app credentials.
    show_dialog: "true",
  });
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

/** Spotify API error that preserves the HTTP status so callers can branch. */
export class SpotifyApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "SpotifyApiError";
  }
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export async function exchangeCodeForToken(
  code: string,
): Promise<TokenResponse> {
  const basic = Buffer.from(
    `${envOrThrow("SPOTIFY_CLIENT_ID")}:${envOrThrow("SPOTIFY_CLIENT_SECRET")}`,
  ).toString("base64");
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: envOrThrow("SPOTIFY_REDIRECT_URI"),
    }).toString(),
  });
  if (!res.ok) {
    throw new Error(
      `Spotify token exchange failed: ${res.status} ${await res.text()}`,
    );
  }
  return (await res.json()) as TokenResponse;
}

export async function setAccessTokenCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: COOKIE_TTL_SECONDS,
    path: "/",
  });
}

export async function getAccessToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(COOKIE_NAME)?.value ?? null;
}

export async function clearAccessToken(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function spotifyGet<T>(token: string, path: string): Promise<T> {
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok)
    throw new SpotifyApiError(
      res.status,
      `spotify GET ${path}: ${res.status} ${await res.text()}`,
    );
  return (await res.json()) as T;
}

export async function spotifyPost<T>(
  token: string,
  path: string,
  body: unknown,
): Promise<T> {
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok)
    throw new SpotifyApiError(
      res.status,
      `spotify POST ${path}: ${res.status} ${await res.text()}`,
    );
  return (await res.json()) as T;
}

interface SpotifySearchTrack {
  uri: string;
  name: string;
  artists: Array<{ name: string }>;
}

interface SpotifySearchResult {
  tracks?: { items?: SpotifySearchTrack[] };
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Token-set overlap in [0,1] - good enough to confirm Spotify's top hit. */
function tokenOverlap(a: string, b: string): number {
  const A = new Set(normalize(a).split(" ").filter(Boolean));
  const B = new Set(normalize(b).split(" ").filter(Boolean));
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter += 1;
  return inter / Math.max(A.size, B.size);
}

function scoreCandidate(
  cand: SpotifySearchTrack,
  wantArtist: string,
  wantTrack: string,
): number {
  const candArtists = cand.artists.map((a) => a.name).join(" ");
  return (
    0.5 * tokenOverlap(wantArtist, candArtists) +
    0.5 * tokenOverlap(wantTrack, cand.name)
  );
}

const GOOD_MATCH = 0.5;

/**
 * Resolve a single track to a Spotify URI on demand using the user's token.
 * Tries progressively looser queries and returns the best confident match, or
 * null when nothing clears the bar. Throws SpotifyApiError (e.g. 429) so the
 * caller can stop gracefully when rate-limited.
 */
export async function resolveTrackUri(
  token: string,
  track: string,
  artist: string,
  album?: string | null,
): Promise<string | null> {
  const queries: string[] = [];
  if (album)
    queries.push(`track:"${track}" artist:"${artist}" album:"${album}"`);
  queries.push(`track:"${track}" artist:"${artist}"`);
  queries.push(`${track} ${artist}`);

  let best: { score: number; uri: string } | null = null;
  for (const q of queries) {
    const data = await spotifyGet<SpotifySearchResult>(
      token,
      `/search?q=${encodeURIComponent(q)}&type=track&limit=5`,
    );
    for (const cand of data.tracks?.items ?? []) {
      const s = scoreCandidate(cand, artist, track);
      if (!best || s > best.score) best = { score: s, uri: cand.uri };
    }
    if (best && best.score >= 0.92) break;
  }
  return best && best.score >= GOOD_MATCH ? best.uri : null;
}
