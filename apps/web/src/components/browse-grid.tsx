import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TrackCard } from "./track-card";
import type { Track } from "@/lib/types";

interface BrowseGridProps {
  title: string;
  subtitle: string;
  tracks: Track[];
}

export function BrowsePage({ title, subtitle, tracks }: BrowseGridProps) {
  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-white/[0.08] bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-11 max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium tracking-[-0.01em] text-white/80 transition hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Fantano
          </Link>
          <div className="text-[12px] text-white/40">
            {tracks.length.toLocaleString()} tracks
          </div>
        </div>
      </nav>

      <main className="min-h-screen bg-[#272729] text-white">
        <section className="mx-auto max-w-6xl px-6 pb-12 pt-16 sm:pt-20">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#2997ff]">
            {subtitle}
          </p>
          <h1
            className="font-display mt-3 text-4xl font-semibold leading-[1.05] text-white sm:text-5xl lg:text-6xl"
            style={{ letterSpacing: "-0.022em" }}
          >
            {title}
          </h1>

          {tracks.length === 0 ? (
            <div className="mt-12 flex flex-col items-center justify-center rounded-[18px] border border-white/[0.06] bg-[#2a2a2c] py-20 text-center">
              <p className="text-[15px] text-white/60">
                Fantano hasn&apos;t favored anything here yet.
              </p>
              <Link
                href="/"
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#2997ff] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#0071e3]"
              >
                Back to search
              </Link>
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {tracks.map((t, i) => (
                <TrackCard key={t.uid} track={t} index={i} />
              ))}
            </div>
          )}
        </section>

        <footer className="border-t border-white/[0.06] bg-[#1d1d1f]">
          <div className="mx-auto max-w-6xl px-6 py-10 text-[12px] text-white/40">
            Not affiliated with Anthony Fantano or theneedledrop. Public YouTube
            data only.
          </div>
        </footer>
      </main>
    </>
  );
}
