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
    show_dialog: "false",
  });
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
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
    throw new Error(`spotify GET ${path}: ${res.status} ${await res.text()}`);
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
    throw new Error(`spotify POST ${path}: ${res.status} ${await res.text()}`);
  return (await res.json()) as T;
}
