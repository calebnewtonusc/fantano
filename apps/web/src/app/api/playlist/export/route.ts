import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getGenreVocabulary, searchTracks } from "@/lib/db";
import { extractFilter } from "@/lib/filter";
import { getAccessToken, spotifyGet, spotifyPost } from "@/lib/spotify-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  prompt: z.string().min(1).max(500),
});

interface SpotifyUser {
  id: string;
}

interface SpotifyPlaylist {
  id: string;
  external_urls: { spotify: string };
}

function playlistNameFromPrompt(prompt: string, explanation: string): string {
  // Prefer the LLM's explanation since it's already a clean phrase;
  // fall back to the user's prompt.
  const base = explanation.replace(/^Showing\s+/i, "").replace(/\.$/, "");
  const trimmed = base.length > 90 ? base.slice(0, 87) + "..." : base;
  return `Fantano FAV: ${trimmed || prompt}`;
}

export async function POST(req: NextRequest) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: "not_connected" }, { status: 401 });
  }

  const body = bodySchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  try {
    // Re-run the LLM filter + search so the playlist mirrors what the user sees.
    const vocabulary = await getGenreVocabulary();
    const { filter, explanation } = await extractFilter(
      body.data.prompt,
      vocabulary,
    );
    const { rows } = await searchTracks(filter);

    const uris = Array.from(
      new Set(rows.map((r) => r.spotify_uri).filter((u): u is string => !!u)),
    );

    if (uris.length === 0) {
      return NextResponse.json(
        {
          error:
            "No tracks in this result are enriched with Spotify URIs yet. Try again in a few minutes once enrichment is further along.",
        },
        { status: 422 },
      );
    }

    const me = await spotifyGet<SpotifyUser>(token, "/me");
    const playlist = await spotifyPost<SpotifyPlaylist>(
      token,
      `/users/${me.id}/playlists`,
      {
        name: playlistNameFromPrompt(body.data.prompt, explanation),
        description: `Auto-built from a search on fantano-web. Prompt: "${body.data.prompt}".`,
        public: false,
      },
    );

    // Spotify caps adds at 100 URIs per request.
    for (let i = 0; i < uris.length; i += 100) {
      await spotifyPost(token, `/playlists/${playlist.id}/tracks`, {
        uris: uris.slice(i, i + 100),
      });
    }

    return NextResponse.json({
      data: {
        playlist_id: playlist.id,
        playlist_url: playlist.external_urls.spotify,
        added: uris.length,
        total_in_search: rows.length,
        skipped_no_uri: rows.length - uris.length,
      },
    });
  } catch (err) {
    console.error("[POST /api/playlist/export]", err);
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
