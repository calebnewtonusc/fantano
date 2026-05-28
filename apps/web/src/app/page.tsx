import { Suspense } from "react";
import Link from "next/link";
import { SearchForm } from "@/components/search-form";
import { CountUp } from "@/components/count-up";
import { ScrollNav } from "@/components/scroll-nav";
import { getStats } from "@/lib/db";

export const dynamic = "force-dynamic";

async function StatsRow() {
  const stats = await getStats().catch(() => null);
  if (!stats) return null;
  return (
    <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-[18px] bg-white/[0.06] sm:grid-cols-4">
      <Stat label="Tracks" value={stats.totalTracks} />
      <Stat label="Albums" value={stats.totalAlbums} />
      <Stat label="Singles" value={stats.totalSingles} />
      <YearStat earliest={stats.earliestYear} latest={stats.latestYear} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[#2a2a2c] px-6 py-7 text-center">
      <CountUp
        value={value}
        className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl"
      />
      <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-white/40">
        {label}
      </p>
    </div>
  );
}

function YearStat({
  earliest,
  latest,
}: {
  earliest: number | null;
  latest: number | null;
}) {
  const label = earliest && latest ? `${earliest}-${latest}` : "-";
  return (
    <div className="bg-[#2a2a2c] px-6 py-7 text-center">
      <p className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {label}
      </p>
      <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-white/40">
        Years
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <ScrollNav />

      <main className="min-h-screen bg-[#272729] text-white">
        <section className="mx-auto max-w-5xl px-6 pb-24 pt-24 sm:pt-32 lg:pt-40">
          <div className="text-center">
            <p className="reveal-up text-xs font-medium uppercase tracking-[0.18em] text-[#2997ff]">
              theneedledrop, indexed
            </p>
            <h1
              className="reveal-up font-display mt-5 text-5xl font-semibold leading-[1.05] text-white sm:text-6xl md:text-7xl lg:text-[80px]"
              style={{ letterSpacing: "-0.022em", animationDelay: "60ms" }}
            >
              Every song
              <br />
              <span className="text-white/80">Fantano has loved.</span>
            </h1>
            <p
              className="reveal-up mx-auto mt-6 max-w-2xl text-[17px] font-normal leading-[1.5] text-[#cccccc] sm:text-[19px]"
              style={{ animationDelay: "160ms" }}
            >
              17,153 tracks. Every FAV from his album reviews, every BEST from
              his Weekly Track Roundups. Ask in plain English, export to
              Spotify.
            </p>

            <div
              className="reveal-up mx-auto mt-12 max-w-2xl"
              style={{ animationDelay: "260ms" }}
            >
              <Suspense
                fallback={
                  <div className="h-14 w-full rounded-full border border-white/10 bg-white/[0.06]" />
                }
              >
                <SearchForm />
              </Suspense>
            </div>

            <Suspense fallback={null}>
              <StatsRow />
            </Suspense>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-3 text-[12px] text-white/40">
              <Link
                href="/random"
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
              >
                Random artist
              </Link>
              <Link
                href="/year/2024"
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
              >
                Browse 2024
              </Link>
              <Link
                href="/genre/cloud%20rap"
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
              >
                Cloud rap
              </Link>
              <Link
                href="/genre/shoegaze"
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
              >
                Shoegaze
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/[0.06] bg-[#1d1d1f]">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-10 text-[12px] text-white/40 sm:flex-row">
            <p>
              Not affiliated with Anthony Fantano or theneedledrop. Public
              YouTube data only.
            </p>
            <p>
              Built by{" "}
              <a
                href="https://github.com/calebnewtonusc"
                className="text-white/60 transition hover:text-white"
              >
                calebnewtonusc
              </a>
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
