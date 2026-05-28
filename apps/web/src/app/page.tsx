import { Suspense } from "react";
import { SearchForm } from "@/components/search-form";
import { getStats } from "@/lib/db";

export const dynamic = "force-dynamic";

async function StatsRow() {
  const stats = await getStats().catch(() => null);
  if (!stats) return null;
  const yearLabel =
    stats.earliestYear && stats.latestYear
      ? `${stats.earliestYear}-${stats.latestYear}`
      : "-";
  return (
    <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Stat label="Tracks" value={stats.totalTracks.toLocaleString()} />
      <Stat label="Albums" value={stats.totalAlbums.toLocaleString()} />
      <Stat label="Singles" value={stats.totalSingles.toLocaleString()} />
      <Stat label="Years" value={yearLabel} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <p className="bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
        {value}
      </p>
      <p className="mt-1 text-xs uppercase tracking-wide text-zinc-500">
        {label}
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.18),_transparent_60%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

      <section className="relative mx-auto max-w-6xl px-4 pb-24 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-indigo-300">
            theneedledrop, indexed
          </span>
          <h1 className="reveal-up mt-6 bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-4xl font-bold leading-[1.1] tracking-tight text-transparent sm:text-5xl md:text-6xl lg:text-7xl">
            Every song
            <br />
            Fantano has loved.
          </h1>
          <p
            className="reveal-up mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg"
            style={{ animationDelay: "120ms" }}
          >
            A searchable archive of every track Anthony Fantano has flagged as a
            FAV in his album reviews and BEST in his Weekly Track Roundups. Ask
            for it in plain English. Filtered by genre, year, label, vibe.
          </p>

          <div
            className="reveal-up mx-auto mt-10 max-w-2xl"
            style={{ animationDelay: "240ms" }}
          >
            <SearchForm />
          </div>

          <Suspense fallback={null}>
            <StatsRow />
          </Suspense>
        </div>
      </section>

      <footer className="relative border-t border-zinc-900 bg-zinc-950">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-xs text-zinc-500 sm:flex-row sm:px-6 lg:px-8">
          <p>
            Not affiliated with Anthony Fantano or theneedledrop. Data scraped
            from public YouTube descriptions.
          </p>
          <p>
            Built by{" "}
            <a
              href="https://github.com/calebnewtonusc"
              className="text-zinc-400 transition hover:text-white"
            >
              calebnewtonusc
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
