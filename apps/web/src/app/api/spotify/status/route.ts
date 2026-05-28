import { NextResponse } from "next/server";
import { getAccessToken, spotifyGet } from "@/lib/spotify-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SpotifyUser {
  id: string;
  display_name: string | null;
  images?: Array<{ url: string }>;
}

export async function GET() {
  const token = await getAccessToken();
  if (!token) return NextResponse.json({ data: { connected: false } });

  try {
    const me = await spotifyGet<SpotifyUser>(token, "/me");
    return NextResponse.json({
      data: {
        connected: true,
        user_id: me.id,
        display_name: me.display_name,
        avatar: me.images?.[0]?.url ?? null,
      },
    });
  } catch (err) {
    console.error("[GET /api/spotify/status]", err);
    return NextResponse.json({ data: { connected: false } });
  }
}
