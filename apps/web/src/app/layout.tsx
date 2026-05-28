import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fantano FAV TRACKS - every song Anthony Fantano has loved",
  description:
    "Search every track Anthony Fantano has ever flagged as a FAV in his album reviews and Weekly Track Roundups. Ask for it in plain English.",
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
