import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getGenreVocabulary, searchTracks } from "@/lib/db";
import { extractFilter } from "@/lib/filter";
import {
  clearAccessToken,
  getAccessToken,
  resolveTrackUri,
  SpotifyApiError,
  spotifyGet,
  spotifyPost,
} from "@/lib/spotify-auth";

// Dev Mode has a low rate limit, so bound how many on-demand lookups one export
// fires and pace them slightly. Cached URIs don't count against either.
const MAX_LOOKUPS = 100;
const LOOKUP_DELAY_MS = 120;

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

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

    // Resolve the result subset to Spotify URIs at export time. Prefer any URI
    // we've already cached; search Spotify on demand (under the user's token)
    // for the rest. If Spotify throttles us mid-way, stop and ship what we have.
    const uris = new Set<string>();
    let lookups = 0;
    let rateLimited = false;
    for (const r of rows) {
      if (r.spotify_uri) {
        uris.add(r.spotify_uri);
        continue;
      }
      // Once throttled or capped, stop *looking up* but keep scanning so cached
      // URIs further down the list still make it into the playlist.
      if (rateLimited || lookups >= MAX_LOOKUPS) continue;
      if (lookups > 0) await sleep(LOOKUP_DELAY_MS);
      lookups += 1;
      try {
        const uri = await resolveTrackUri(token, r.track, r.artist, r.album);
        if (uri) uris.add(uri);
      } catch (err) {
        if (err instanceof SpotifyApiError && err.status === 429) {
          rateLimited = true;
          continue;
        }
        // 401/403 mean re-auth / not-allowlisted - let the outer catch handle.
        if (
          err instanceof SpotifyApiError &&
          (err.status === 401 || err.status === 403)
        ) {
          throw err;
        }
        // Transient single-track lookup failure: skip it, keep going.
      }
    }

    const uriList = Array.from(uris);
    if (uriList.length === 0) {
      return NextResponse.json(
        {
          error: rateLimited
            ? "Spotify rate-limited the lookup before any track resolved. Give it a minute, or try a smaller search."
            : "Couldn't match any of these tracks on Spotify. Try a different search.",
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
    for (let i = 0; i < uriList.length; i += 100) {
      await spotifyPost(token, `/playlists/${playlist.id}/tracks`, {
        uris: uriList.slice(i, i + 100),
      });
    }

    return NextResponse.json({
      data: {
        playlist_id: playlist.id,
        playlist_url: playlist.external_urls.spotify,
        added: uriList.length,
        total_in_search: rows.length,
        skipped_no_uri: rows.length - uriList.length,
        rate_limited: rateLimited,
      },
    });
  } catch (err) {
    console.error("[POST /api/playlist/export]", err);

    if (err instanceof SpotifyApiError) {
      // Token is stale/invalid - drop it so the next attempt re-authenticates.
      if (err.status === 401) {
        await clearAccessToken();
        return NextResponse.json({ error: "not_connected" }, { status: 401 });
      }
      // 403 = the logged-in account isn't allowed to use this Spotify app yet
      // (Development Mode allowlist) or the grant is missing playlist scopes.
      // Clear the token so the user can reconnect after being allowlisted.
      if (err.status === 403) {
        await clearAccessToken();
        return NextResponse.json(
          {
            error:
              "Spotify rejected the playlist (403). This app is in Spotify Development Mode, so your account must be added under the app's User Management. Once added, click Connect Spotify again.",
          },
          { status: 403 },
        );
      }
    }

    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
