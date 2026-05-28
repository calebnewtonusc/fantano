import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, setAccessTokenCookie } from "@/lib/spotify-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
      new URL(`${returnTo}?spotify_error=${error || "missing_code"}`, req.url),
    );
  }

  try {
    const token = await exchangeCodeForToken(code);
    await setAccessTokenCookie(token.access_token);
    return NextResponse.redirect(
      new URL(`${returnTo}?spotify=connected`, req.url),
    );
  } catch (err) {
    console.error("[GET /api/spotify/callback]", err);
    const msg = err instanceof Error ? err.message : "exchange_failed";
    return NextResponse.redirect(
      new URL(`${returnTo}?spotify_error=${encodeURIComponent(msg)}`, req.url),
    );
  }
}
