import { ImageResponse } from "next/og";
import { getStats } from "@/lib/db";

export const runtime = "nodejs";
export const alt = "Fantano FAV TRACKS";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  const stats = await getStats().catch(() => ({
    totalTracks: 17153,
    earliestYear: 2009,
    latestYear: 2026,
  }));
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background:
          "radial-gradient(ellipse at top, #0066cc 0%, #1d1d1f 50%, #000000 100%)",
      }}
    >
      <div
        style={{
          color: "#2997ff",
          fontSize: 22,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 4,
          marginBottom: 24,
          display: "flex",
        }}
      >
        theneedledrop, indexed
      </div>
      <div
        style={{
          color: "#ffffff",
          fontSize: 90,
          fontWeight: 700,
          lineHeight: 1.04,
          letterSpacing: -2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div>Every song</div>
        <div style={{ color: "rgba(255,255,255,0.7)" }}>Fantano has loved.</div>
      </div>
      <div
        style={{
          display: "flex",
          gap: 40,
          marginTop: 56,
          color: "#cccccc",
          fontSize: 28,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ color: "#ffffff", fontWeight: 600 }}>
            {stats.totalTracks.toLocaleString()}
          </span>
          <span
            style={{
              fontSize: 16,
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            tracks
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ color: "#ffffff", fontWeight: 600 }}>
            {stats.earliestYear && stats.latestYear
              ? `${stats.earliestYear}-${stats.latestYear}`
              : "-"}
          </span>
          <span
            style={{
              fontSize: 16,
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            years
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ color: "#ffffff", fontWeight: 600 }}>
            Plain English
          </span>
          <span
            style={{
              fontSize: 16,
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            AI search
          </span>
        </div>
      </div>
    </div>,
    size,
  );
}
