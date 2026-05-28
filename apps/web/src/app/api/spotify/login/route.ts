import { NextRequest, NextResponse } from "next/server";
import { buildAuthorizeUrl } from "@/lib/spotify-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const returnTo = req.nextUrl.searchParams.get("return_to") || "/";
  // Pack the return path into state so the callback can bounce the user back.
  const state = Buffer.from(JSON.stringify({ return_to: returnTo })).toString(
    "base64url",
  );
  return NextResponse.redirect(buildAuthorizeUrl(state));
}
