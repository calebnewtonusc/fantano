import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

const SITE = "https://fantano-web-production.up.railway.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Fantano FAV TRACKS - every song Anthony Fantano has loved",
    template: "%s | Fantano FAV TRACKS",
  },
  description:
    "Search every track Anthony Fantano has ever flagged as a FAV in his album reviews and Weekly Track Roundups. Ask in plain English, export to Spotify.",
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "Fantano FAV TRACKS",
    title: "Every song Fantano has loved",
    description:
      "17,153 tracks Anthony Fantano flagged as FAVs across album reviews and Weekly Track Roundups. AI search. Spotify export.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Every song Fantano has loved",
    description:
      "17,153 tracks Anthony Fantano flagged as FAVs. AI search. Spotify export.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark">
      <body className="min-h-full antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
