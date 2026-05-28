"use client";

import { Sparkles, ArrowRight, AlertCircle, Search } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
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
];

export function SearchForm() {
  const [prompt, setPrompt] = useState("");

  const { mutate, data, error, isPending } = useMutation<
    { data: SearchResponse },
    Error,
    string
  >({
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isPending) return;
    mutate(prompt.trim());
  };

  const handleSuggestion = (s: string) => {
    setPrompt(s);
    mutate(s);
  };

  return (
    <div className="w-full text-left">
      {/* Search row — pill input + pill primary CTA, the two Apple button grammars. */}
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
          disabled={isPending || !prompt.trim()}
          className="absolute right-2 top-1/2 inline-flex h-10 -translate-y-1/2 items-center gap-1.5 rounded-full bg-[#2997ff] px-5 text-[14px] font-medium text-white transition hover:bg-[#0071e3] active:bg-[#0066cc] disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/50"
        >
          {isPending ? "Searching" : "Ask"}
          {!isPending && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </button>
      </form>

      {/* Suggestion chips — Apple "configurator option chips" rounded.pill. */}
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => handleSuggestion(s)}
            disabled={isPending}
            className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[12px] text-white/70 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-10 flex items-start gap-3 rounded-[18px] border border-red-500/20 bg-red-500/[0.05] p-5">
          <AlertCircle
            className="mt-0.5 h-5 w-5 shrink-0 text-red-400"
            aria-hidden="true"
          />
          <div>
            <p className="text-[14px] font-semibold text-red-300">
              Something broke
            </p>
            <p className="mt-1 text-[13px] text-red-400/80">{error.message}</p>
          </div>
        </div>
      )}

      {isPending && (
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <TrackCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!isPending && data?.data && (
        <div className="mt-12 space-y-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-white/[0.06] pb-5">
            <p className="text-[15px] text-white/90">{data.data.explanation}</p>
            <p className="text-[12px] uppercase tracking-[0.12em] text-white/40">
              {data.data.tracks.length} of {data.data.total.toLocaleString()}
            </p>
          </div>

          {data.data.tracks.length === 0 ? (
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.data.tracks.map((t, i) => (
                <TrackCard key={t.uid} track={t} index={i} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
