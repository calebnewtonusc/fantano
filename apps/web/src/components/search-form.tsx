"use client";

import { Sparkles, ArrowRight, AlertCircle } from "lucide-react";
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
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <Sparkles
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500"
          aria-hidden="true"
        />
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask for songs in plain English…"
          aria-label="Search query"
          className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/80 py-4 pl-12 pr-32 text-base text-white placeholder:text-zinc-500 shadow-xl shadow-black/30 backdrop-blur-md transition-all focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
        <button
          type="submit"
          disabled={isPending || !prompt.trim()}
          className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500 active:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Searching" : "Ask"}
          {!isPending && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => handleSuggestion(s)}
            disabled={isPending}
            className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
          <AlertCircle
            className="mt-0.5 h-5 w-5 shrink-0 text-red-400"
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-medium text-red-300">Something broke</p>
            <p className="mt-1 text-sm text-red-400/80">{error.message}</p>
          </div>
        </div>
      )}

      {isPending && (
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <TrackCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!isPending && data?.data && (
        <div className="mt-10 space-y-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm text-zinc-400">
              <span className="text-zinc-200">{data.data.explanation}</span>
            </p>
            <p className="text-xs text-zinc-500">
              {data.data.tracks.length} of {data.data.total.toLocaleString()}{" "}
              matches
            </p>
          </div>

          {data.data.tracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/40 py-16 text-center">
              <Sparkles
                className="mb-3 h-8 w-8 text-zinc-600"
                aria-hidden="true"
              />
              <h3 className="text-lg font-semibold text-zinc-200">
                No tracks matched
              </h3>
              <p className="mt-1 max-w-sm text-sm text-zinc-500">
                Try a broader genre, a different year range, or one of the
                suggestions above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.data.tracks.map((t, i) => (
                <TrackCard key={t.id} track={t} index={i} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
