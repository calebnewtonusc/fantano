import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { topArtists } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export const metadata: Metadata = {
  title: "All artists",
  description:
    "Every artist Anthony Fantano has flagged tracks from, ranked by how many of their songs are in his FAVs.",
};

function artistSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default async function ArtistsIndex() {
  const artists = await topArtists(500).catch(() => []);
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
            {artists.length.toLocaleString()} artists
          </div>
        </div>
      </nav>

      <main className="min-h-screen bg-[#272729] text-white">
        <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 sm:pt-20">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#2997ff]">
            Artists
          </p>
          <h1
            className="font-display mt-3 text-4xl font-semibold leading-[1.05] text-white sm:text-5xl lg:text-6xl"
            style={{ letterSpacing: "-0.022em" }}
          >
            Everyone Fantano has loved.
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] text-white/60">
            Ranked by how many of their tracks Fantano has flagged as FAVs
            across his album reviews and Weekly Track Roundups.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-[18px] bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-3">
            {artists.map((a, i) => (
              <Link
                key={a.artist}
                href={`/artist/${artistSlug(a.artist)}`}
                className="group flex items-center justify-between bg-[#2a2a2c] px-5 py-4 transition hover:bg-[#303033]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="font-display w-8 shrink-0 text-[12px] tabular-nums text-white/30">
                    {String(i + 1).padStart(3, "0")}
                  </span>
                  <span className="font-display truncate text-[15px] font-semibold tracking-[-0.01em] text-white transition group-hover:text-[#2997ff]">
                    {a.artist}
                  </span>
                </div>
                <span className="ml-3 shrink-0 rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[11px] font-medium tabular-nums text-white/60">
                  {a.n}
                </span>
              </Link>
            ))}
          </div>
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
