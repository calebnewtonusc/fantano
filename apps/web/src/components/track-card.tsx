import { ExternalLink, Music2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Track } from "@/lib/types";

interface TrackCardProps {
  track: Track;
  index: number;
}

function spotifyUrl(track: Track): string {
  if (track.spotify_uri) {
    const id = track.spotify_uri.split(":").pop();
    return `https://open.spotify.com/track/${id}`;
  }
  const q = encodeURIComponent(`${track.track} ${track.artist}`);
  return `https://open.spotify.com/search/${q}`;
}

function artistSlug(artist: string): string {
  return artist
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Deterministic gradient per (artist, album) so missing cover art still has personality. */
function fallbackGradient(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++)
    h = (h * 31 + seed.charCodeAt(i)) & 0xffff;
  const hue1 = h % 360;
  const hue2 = (hue1 + 60) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 55%, 28%) 0%, hsl(${hue2}, 60%, 18%) 100%)`;
}

export function TrackCard({ track, index }: TrackCardProps) {
  const isAlbum = track.source === "album";
  const seed = `${track.artist}|${track.album || track.track}`;
  const gradient = fallbackGradient(seed);

  return (
    <article
      className="reveal-up group flex flex-col gap-3 overflow-hidden rounded-[18px] bg-[#2a2a2c] transition-colors duration-200 hover:bg-[#303033]"
      style={{ animationDelay: `${Math.min(index, 30) * 18}ms` }}
    >
      {/* Cover art / gradient placeholder, 1:1 aspect */}
      <div
        className="relative aspect-square w-full overflow-hidden bg-[#1d1d1f]"
        style={track.cover_url ? undefined : { background: gradient }}
      >
        {track.cover_url ? (
          <Image
            src={track.cover_url}
            alt={`${track.album || track.track} cover`}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Music2 className="h-10 w-10 text-white/30" aria-hidden="true" />
          </div>
        )}
        <span
          className={
            isAlbum
              ? "absolute right-3 top-3 rounded-full bg-[#2997ff]/95 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-white backdrop-blur"
              : "absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-white backdrop-blur"
          }
        >
          {isAlbum ? "Album" : "Single"}
        </span>
      </div>

      <div className="flex flex-col gap-2 px-4 pb-4 pt-1">
        <div className="min-w-0">
          <h3
            className="font-display truncate text-[15px] font-semibold leading-tight tracking-[-0.01em] text-white"
            title={track.track}
          >
            {track.track}
          </h3>
          <Link
            href={`/artist/${artistSlug(track.artist)}`}
            className="block truncate text-[13px] text-white/60 transition hover:text-[#2997ff]"
          >
            {track.artist}
          </Link>
        </div>

        {track.album && (
          <p className="truncate text-[11px] text-white/40" title={track.album}>
            {track.album}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-white/40">
          {track.release_year && (
            <Link
              href={`/year/${track.release_year}`}
              className="transition hover:text-[#2997ff]"
            >
              {track.release_year}
            </Link>
          )}
          {track.release_year && track.label && (
            <span className="text-white/15">·</span>
          )}
          {track.label && <span className="truncate">{track.label}</span>}
        </div>

        {track.genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {track.genres.slice(0, 3).map((g) => (
              <Link
                key={g}
                href={`/genre/${encodeURIComponent(g)}`}
                className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[9px] uppercase tracking-[0.06em] text-white/55 transition hover:bg-white/10 hover:text-white"
              >
                {g}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center gap-2 pt-2">
          <a
            href={spotifyUrl(track)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#2997ff] px-3 py-1.5 text-[11px] font-medium text-white transition hover:bg-[#0071e3]"
          >
            Spotify
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
          <a
            href={track.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium text-white/60 transition hover:bg-white/[0.06] hover:text-white"
          >
            Review
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}

export function TrackCardSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-[18px] bg-[#2a2a2c]"
      role="status"
      aria-label="Loading track"
    >
      <div className="aspect-square w-full animate-pulse bg-white/[0.04]" />
      <div className="flex flex-col gap-2 px-4 pb-4 pt-3">
        <div className="h-4 w-3/4 animate-pulse rounded bg-white/[0.08]" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-white/[0.06]" />
        <div className="mt-2 flex gap-2">
          <div className="h-5 w-12 animate-pulse rounded-full bg-white/[0.06]" />
          <div className="h-5 w-14 animate-pulse rounded-full bg-white/[0.06]" />
        </div>
        <div className="mt-3 flex gap-2">
          <div className="h-7 w-16 animate-pulse rounded-full bg-white/[0.08]" />
          <div className="h-7 w-14 animate-pulse rounded-full bg-white/[0.06]" />
        </div>
      </div>
    </div>
  );
}
