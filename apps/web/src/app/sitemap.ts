import type { MetadataRoute } from "next";
import { distinctYears, getGenreVocabulary, topArtists } from "@/lib/db";

const BASE = "https://fantano-web-production.up.railway.app";

function artistSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [artists, genres, years] = await Promise.all([
    topArtists(500).catch(() => []),
    getGenreVocabulary(300).catch(() => []),
    distinctYears().catch(() => []),
  ]);

  const entries: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "daily", priority: 1.0 },
  ];

  for (const a of artists) {
    const slug = artistSlug(a.artist);
    if (slug) {
      entries.push({
        url: `${BASE}/artist/${slug}`,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  for (const g of genres) {
    entries.push({
      url: `${BASE}/genre/${encodeURIComponent(g)}`,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  for (const y of years) {
    entries.push({
      url: `${BASE}/year/${y}`,
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  return entries;
}
