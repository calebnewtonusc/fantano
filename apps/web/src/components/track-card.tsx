import { ExternalLink } from "lucide-react";
import type { Track } from "@/lib/types";

interface TrackCardProps {
  track: Track;
  index: number;
}

function spotifyUrl(track: Track): string {
  const q = encodeURIComponent(`${track.track} ${track.artist}`);
  return `https://open.spotify.com/search/${q}`;
}

export function TrackCard({ track, index }: TrackCardProps) {
  const isAlbum = track.source === "album";
  return (
    <article
      className="reveal-up group flex flex-col gap-3 rounded-[18px] bg-[#2a2a2c] p-5 transition-colors duration-200 hover:bg-[#303033]"
      style={{ animationDelay: `${Math.min(index, 30) * 18}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            className="font-display truncate text-[17px] font-semibold leading-tight tracking-[-0.01em] text-white"
            title={track.track}
          >
            {track.track}
          </h3>
          <p className="mt-1 truncate text-[14px] text-white/60">
            {track.artist}
          </p>
        </div>
        <span
          className={
            isAlbum
              ? "shrink-0 rounded-full bg-[#2997ff]/15 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-[#2997ff]"
              : "shrink-0 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-white/70"
          }
        >
          {isAlbum ? "Album" : "Single"}
        </span>
      </div>

      {track.album && (
        <p className="truncate text-[12px] text-white/40">{track.album}</p>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/40">
        {track.release_year && <span>{track.release_year}</span>}
        {track.release_year && track.label && (
          <span className="text-white/15">·</span>
        )}
        {track.label && <span className="truncate">{track.label}</span>}
      </div>

      {track.genres.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {track.genres.slice(0, 4).map((g) => (
            <span
              key={g}
              className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[10px] uppercase tracking-[0.06em] text-white/55"
            >
              {g}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center gap-2 pt-2">
        <a
          href={spotifyUrl(track)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-[#2997ff] px-3.5 py-1.5 text-[12px] font-medium text-white transition hover:bg-[#0071e3]"
        >
          Spotify
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
        <a
          href={track.video_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium text-white/60 transition hover:bg-white/[0.06] hover:text-white"
        >
          Review
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}

export function TrackCardSkeleton() {
  return (
    <div
      className="flex flex-col gap-3 rounded-[18px] bg-[#2a2a2c] p-5"
      role="status"
      aria-label="Loading track"
    >
      <div className="animate-pulse">
        <div className="h-4 w-3/4 rounded bg-white/[0.08]" />
        <div className="mt-2 h-3 w-1/2 rounded bg-white/[0.06]" />
        <div className="mt-3 h-3 w-1/3 rounded bg-white/[0.06]" />
        <div className="mt-4 flex gap-2">
          <div className="h-5 w-14 rounded-full bg-white/[0.06]" />
          <div className="h-5 w-16 rounded-full bg-white/[0.06]" />
        </div>
        <div className="mt-4 flex gap-2">
          <div className="h-7 w-20 rounded-full bg-white/[0.08]" />
          <div className="h-7 w-16 rounded-full bg-white/[0.06]" />
        </div>
      </div>
    </div>
  );
}
