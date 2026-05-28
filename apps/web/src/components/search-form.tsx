"use client";

import {
  Sparkles,
  ArrowRight,
  AlertCircle,
  Search,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { TrackCard, TrackCardSkeleton } from "./track-card";
import type { SearchResponse } from "@/lib/types";

const SUGGESTIONS = [
  "Give me 100 folk songs",
  "Best hip hop tracks of 2014",
  "Recent shoegaze",
  "Cloud rap from the 2010s",
  "Surprise me with 30 random favs",
  "Anything on TDE",
  "Songs like Bladee",
  "Folk but not Bon Iver",
];

interface SpotifyStatus {
  connected: boolean;
  display_name?: string | null;
  user_id?: string;
  avatar?: string | null;
}

interface ExportResult {
  playlist_id: string;
  playlist_url: string;
  added: number;
  total_in_search: number;
  skipped_no_uri: number;
}

export function SearchForm() {
  const [prompt, setPrompt] = useState("");

  const { data: status, refetch: refetchStatus } = useQuery<{
    data: SpotifyStatus;
  }>({
    queryKey: ["spotify-status"],
    queryFn: async () => {
      const r = await fetch("/api/spotify/status");
      return r.json() as Promise<{ data: SpotifyStatus }>;
    },
    refetchOnWindowFocus: true,
  });

  const search = useMutation<{ data: SearchResponse }, Error, string>({
    mutationFn: async (p: string) => {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: p }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || `Search failed (${res.status})`);
      }
      return res.json() as Promise<{ data: SearchResponse }>;
    },
  });

  const exportToPlaylist = useMutation<{ data: ExportResult }, Error, string>({
    mutationFn: async (p: string) => {
      const res = await fetch("/api/playlist/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: p }),
      });
      if (res.status === 401) {
        // Not connected - bounce through Spotify OAuth.
        window.location.href = `/api/spotify/login?return_to=${encodeURIComponent(
          window.location.pathname + window.location.search,
        )}`;
        throw new Error("Redirecting to Spotify");
      }
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || `Export failed (${res.status})`);
      }
      return res.json() as Promise<{ data: ExportResult }>;
    },
    onSuccess: () => {
      refetchStatus();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || search.isPending) return;
    search.mutate(prompt.trim());
  };

  const handleSuggestion = (s: string) => {
    setPrompt(s);
    search.mutate(s);
  };

  return (
    <div className="w-full text-left">
      <form onSubmit={handleSubmit} className="relative">
        <Search
          className="pointer-events-none absolute left-5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-white/40"
          aria-hidden="true"
        />
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask for songs in plain English"
          aria-label="Search query"
          className="h-14 w-full rounded-full border border-white/10 bg-white/[0.06] pl-12 pr-36 text-[17px] font-normal text-white placeholder:text-white/40 backdrop-blur-sm transition-all focus:border-[#2997ff]/60 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-[#2997ff]/40"
        />
        <button
          type="submit"
          disabled={search.isPending || !prompt.trim()}
          className="absolute right-2 top-1/2 inline-flex h-10 -translate-y-1/2 items-center gap-1.5 rounded-full bg-[#2997ff] px-5 text-[14px] font-medium text-white transition hover:bg-[#0071e3] active:bg-[#0066cc] disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/50"
        >
          {search.isPending ? "Searching" : "Ask"}
          {!search.isPending && (
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </form>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => handleSuggestion(s)}
            disabled={search.isPending}
            className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[12px] text-white/70 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      {search.error && (
        <div className="mt-10 flex items-start gap-3 rounded-[18px] border border-red-500/20 bg-red-500/[0.05] p-5">
          <AlertCircle
            className="mt-0.5 h-5 w-5 shrink-0 text-red-400"
            aria-hidden="true"
          />
          <div>
            <p className="text-[14px] font-semibold text-red-300">
              Something broke
            </p>
            <p className="mt-1 text-[13px] text-red-400/80">
              {search.error.message}
            </p>
          </div>
        </div>
      )}

      {search.isPending && (
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <TrackCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!search.isPending && search.data?.data && (
        <div className="mt-12 space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/[0.06] pb-5">
            <div className="min-w-0 flex-1">
              <p className="text-[15px] leading-snug text-white/90">
                {search.data.data.explanation}
              </p>
              <p className="mt-1 text-[12px] uppercase tracking-[0.12em] text-white/40">
                {search.data.data.tracks.length} of{" "}
                {search.data.data.total.toLocaleString()} matches
              </p>
            </div>
            {search.data.data.tracks.length > 0 && (
              <button
                type="button"
                onClick={() => exportToPlaylist.mutate(prompt || "")}
                disabled={exportToPlaylist.isPending || !prompt}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#1db954] px-4 py-2 text-[13px] font-medium text-white shadow-lg shadow-[#1db954]/20 transition hover:bg-[#1ed760] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {exportToPlaylist.isPending
                  ? "Exporting..."
                  : status?.data?.connected
                    ? "Export to Spotify"
                    : "Connect Spotify and export"}
              </button>
            )}
          </div>

          {exportToPlaylist.data?.data && (
            <div className="flex items-start gap-3 rounded-[18px] border border-[#1db954]/30 bg-[#1db954]/[0.06] p-5">
              <CheckCircle2
                className="mt-0.5 h-5 w-5 shrink-0 text-[#1db954]"
                aria-hidden="true"
              />
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-white">
                  Playlist created with{" "}
                  {exportToPlaylist.data.data.added.toLocaleString()} tracks
                </p>
                <p className="mt-1 text-[12px] text-white/60">
                  {exportToPlaylist.data.data.skipped_no_uri > 0 &&
                    `Skipped ${exportToPlaylist.data.data.skipped_no_uri.toLocaleString()} tracks not yet Spotify-matched. `}
                  Saved private to your Spotify account.
                </p>
              </div>
              <a
                href={exportToPlaylist.data.data.playlist_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-medium text-white transition hover:bg-white/20"
              >
                Open
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </div>
          )}

          {exportToPlaylist.error && (
            <div className="rounded-[18px] border border-amber-500/30 bg-amber-500/[0.05] p-4 text-[13px] text-amber-300">
              {exportToPlaylist.error.message}
            </div>
          )}

          {search.data.data.tracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[18px] border border-white/[0.06] bg-[#2a2a2c] py-20 text-center">
              <Sparkles
                className="mb-3 h-8 w-8 text-white/30"
                aria-hidden="true"
              />
              <h3 className="text-[17px] font-semibold text-white">
                No tracks matched
              </h3>
              <p className="mt-2 max-w-sm text-[14px] text-white/50">
                Try a broader genre, a different year range, or one of the
                suggestions above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {search.data.data.tracks.map((t, i) => (
                <TrackCard key={t.uid} track={t} index={i} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
