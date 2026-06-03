import { NextResponse } from "next/server";
import { clearAccessToken } from "@/lib/spotify-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Clears the stored Spotify token so the user can reconnect - e.g. to switch
// accounts or to re-auth under rotated app credentials.
export async function POST() {
  await clearAccessToken();
  return NextResponse.json({ data: { connected: false } });
}
