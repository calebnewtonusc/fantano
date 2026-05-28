import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BrowsePage } from "@/components/browse-grid";
import { tracksByYear } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 300;

interface PageProps {
  params: Promise<{ year: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { year } = await params;
  return {
    title: `${year} - Fantano FAV TRACKS`,
    description: `Every track from ${year} that Anthony Fantano has flagged as a FAV in his album reviews or BEST in his Weekly Track Roundups.`,
  };
}

export default async function YearPage({ params }: PageProps) {
  const { year: yearStr } = await params;
  const year = Number(yearStr);
  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    notFound();
  }
  const tracks = await tracksByYear(year).catch(() => []);
  return <BrowsePage title={String(year)} subtitle="Year" tracks={tracks} />;
}
