import type { Metadata } from "next";
import { BrowsePage } from "@/components/browse-grid";
import { tracksByArtist } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

function readableName(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const name = readableName(slug);
  return {
    title: `${name} - Fantano FAV TRACKS`,
    description: `Every song by ${name} that Anthony Fantano has flagged as a FAV in his album reviews or BEST in his Weekly Track Roundups.`,
  };
}

export default async function ArtistPage({ params }: PageProps) {
  const { slug } = await params;
  const tracks = await tracksByArtist(slug).catch(() => []);
  return (
    <BrowsePage title={readableName(slug)} subtitle="Artist" tracks={tracks} />
  );
}
