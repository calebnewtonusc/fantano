import type { Metadata } from "next";
import { BrowsePage } from "@/components/browse-grid";
import { tracksByGenre } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

function readableGenre(slug: string): string {
  return decodeURIComponent(slug).replace(/-/g, " ").toLowerCase();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const name = readableGenre(slug);
  return {
    title: `${name} - Fantano FAV TRACKS`,
    description: `Every ${name} track Anthony Fantano has flagged as a FAV in his album reviews.`,
  };
}

export default async function GenrePage({ params }: PageProps) {
  const { slug } = await params;
  const tracks = await tracksByGenre(slug).catch(() => []);
  return (
    <BrowsePage title={readableGenre(slug)} subtitle="Genre" tracks={tracks} />
  );
}
