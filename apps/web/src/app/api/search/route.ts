import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchTracks, getGenreVocabulary } from "@/lib/db";
import { extractFilter } from "@/lib/filter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  prompt: z.string().min(1).max(500),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const body = bodySchema.safeParse(json);
    if (!body.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: body.error.flatten() },
        { status: 400 },
      );
    }

    const vocabulary = await getGenreVocabulary();
    const { filter, explanation } = await extractFilter(
      body.data.prompt,
      vocabulary,
    );
    const { rows, total } = await searchTracks(filter);

    return NextResponse.json(
      {
        data: {
          filter,
          tracks: rows,
          total,
          explanation,
        },
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("[POST /api/search]", err);
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
