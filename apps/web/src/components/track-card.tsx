import { ExternalLink, Disc3, Calendar, Tag } from "lucide-react";
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
  return (
    <div
      className="reveal-up group relative flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900"
      style={{ animationDelay: `${Math.min(index, 30) * 25}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold leading-tight text-zinc-50">
            {track.track}
          </h3>
          <p className="mt-1 truncate text-sm text-zinc-400">{track.artist}</p>
        </div>
        <span className="shrink-0 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-indigo-300">
          {track.source === "roundup" ? "Roundup" : "Review"}
        </span>
      </div>

      {track.album && (
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Disc3 className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="truncate">{track.album}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
        {track.release_year && (
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            {track.release_year}
          </span>
        )}
        {track.label && (
          <span className="inline-flex items-center gap-1">
            <Tag className="h-3.5 w-3.5" aria-hidden="true" />
            {track.label}
          </span>
        )}
      </div>

      {track.genres.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {track.genres.slice(0, 5).map((g) => (
            <span
              key={g}
              className="rounded-full bg-zinc-800/80 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-300"
            >
              {g}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
        <a
          href={spotifyUrl(track)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/20"
        >
          Spotify
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
        <a
          href={track.video_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white"
        >
          Review
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

export function TrackCardSkeleton() {
  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 animate-pulse"
      role="status"
      aria-label="Loading track"
    >
      <div className="h-4 w-3/4 rounded bg-zinc-800" />
      <div className="h-3 w-1/2 rounded bg-zinc-800" />
      <div className="h-3 w-1/3 rounded bg-zinc-800" />
      <div className="flex gap-2">
        <div className="h-5 w-12 rounded-full bg-zinc-800" />
        <div className="h-5 w-16 rounded-full bg-zinc-800" />
      </div>
      <div className="mt-auto flex justify-between pt-2">
        <div className="h-7 w-20 rounded-lg bg-zinc-800" />
        <div className="h-7 w-16 rounded-lg bg-zinc-800" />
      </div>
    </div>
  );
}
