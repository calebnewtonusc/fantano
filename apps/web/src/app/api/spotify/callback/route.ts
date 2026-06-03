import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, setAccessTokenCookie } from "@/lib/spotify-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The public origin of the app. Behind Railway's proxy, req.url resolves to the
 * internal bind (http://localhost:8080), so redirecting against it sends the
 * browser to localhost. Prefer the forwarded headers, then known env values,
 * then the SPOTIFY_REDIRECT_URI origin (guaranteed to match what Spotify used).
 */
function publicOrigin(req: NextRequest): string {
  const proto = req.headers.get("x-forwarded-proto");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (proto && host) return `${proto}://${host}`;
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.RAILWAY_PUBLIC_DOMAIN)
    return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  if (process.env.SPOTIFY_REDIRECT_URI) {
    try {
      return new URL(process.env.SPOTIFY_REDIRECT_URI).origin;
    } catch {
      // fall through
    }
  }
  return req.nextUrl.origin;
}

/** Build an absolute redirect back into the app, merging a status param. */
function backToApp(
  req: NextRequest,
  returnTo: string,
  param: string,
  value: string,
): URL {
  // Only allow same-site path returns (guard against open redirects).
  const path = returnTo.startsWith("/") ? returnTo : "/";
  const dest = new URL(path, publicOrigin(req));
  dest.searchParams.set(param, value);
  return dest;
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");
  const stateRaw = req.nextUrl.searchParams.get("state") || "";
  let returnTo = "/";
  try {
    const parsed = JSON.parse(Buffer.from(stateRaw, "base64url").toString());
    if (typeof parsed.return_to === "string") returnTo = parsed.return_to;
  } catch {
    // ignore - fall back to /
  }

  if (error || !code) {
    return NextResponse.redirect(
      backToApp(req, returnTo, "spotify_error", error || "missing_code"),
    );
  }

  try {
    const token = await exchangeCodeForToken(code);
    await setAccessTokenCookie(token.access_token);
    return NextResponse.redirect(
      backToApp(req, returnTo, "spotify", "connected"),
    );
  } catch (err) {
    console.error("[GET /api/spotify/callback]", err);
    const msg = err instanceof Error ? err.message : "exchange_failed";
    return NextResponse.redirect(
      backToApp(req, returnTo, "spotify_error", msg),
    );
  }
}
