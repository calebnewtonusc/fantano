import { NextResponse } from "next/server";
import { getStats } from "@/lib/db";

export const runtime = "nodejs";
export const revalidate = 300;

export async function GET() {
  try {
    const stats = await getStats();
    return NextResponse.json({ data: stats }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/stats]", err);
    return NextResponse.json(
      { error: "Failed to load stats" },
      { status: 500 },
    );
  }
}
