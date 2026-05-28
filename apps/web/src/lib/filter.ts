import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { SearchFilter } from "./types";

const filterSchema = z.object({
  genres: z.array(z.string()).optional(),
  year_min: z.number().int().min(1900).max(2100).optional(),
  year_max: z.number().int().min(1900).max(2100).optional(),
  artist_contains: z.string().optional(),
  album_contains: z.string().optional(),
  label_contains: z.string().optional(),
  source: z.enum(["review", "roundup"]).optional(),
  limit: z.number().int().min(1).max(500).default(50),
  order_by: z
    .enum([
      "release_year_desc",
      "release_year_asc",
      "upload_date_desc",
      "random",
    ])
    .default("release_year_desc"),
  explanation: z.string(),
});

const filterTool: Anthropic.Tool = {
  name: "query_tracks",
  description:
    "Translate a natural-language music query into a structured filter against the Fantano FAV TRACKS database. Always call this tool — do not respond in plain text.",
  input_schema: {
    type: "object" as const,
    properties: {
      genres: {
        type: "array",
        items: { type: "string" },
        description:
          "Genre keywords to match against the track's genres array (case-insensitive overlap). Use Fantano's specific vocabulary when possible (e.g. 'cloud rap', 'shoegaze', 'experimental hip hop'). Multiple values OR together. Omit if the user did not specify a genre.",
      },
      year_min: {
        type: "integer",
        description: "Earliest release year to include, inclusive.",
      },
      year_max: {
        type: "integer",
        description: "Latest release year to include, inclusive.",
      },
      artist_contains: {
        type: "string",
        description: "Substring match on artist name (case-insensitive).",
      },
      album_contains: {
        type: "string",
        description: "Substring match on album title (case-insensitive).",
      },
      label_contains: {
        type: "string",
        description:
          "Substring match on record label (e.g. 'TDE', 'XL', 'self-released').",
      },
      source: {
        type: "string",
        enum: ["review", "roundup"],
        description:
          "review = tracks from album/EP/mixtape reviews. roundup = best tracks from Weekly Track Roundups (singles). Omit to include both.",
      },
      limit: {
        type: "integer",
        description:
          "Number of tracks to return. Default 50 if unspecified. The user may explicitly request a number (e.g. 'list 100 folk songs' -> 100). Cap at 500.",
      },
      order_by: {
        type: "string",
        enum: [
          "release_year_desc",
          "release_year_asc",
          "upload_date_desc",
          "random",
        ],
        description:
          "release_year_desc (default, newest releases first), release_year_asc, upload_date_desc (most recently reviewed by Fantano), or random (variety).",
      },
      explanation: {
        type: "string",
        description:
          "One-sentence plain-English summary of how you interpreted the user's query.",
      },
    },
    required: ["limit", "order_by", "explanation"],
  },
};

const SYSTEM_PROMPT = `You are the search backend for a site that catalogues every track Anthony Fantano (theneedledrop) has ever flagged as a FAV TRACK (in album reviews) or BEST TRACK (in Weekly Track Roundups).

Your only job: convert the user's natural-language request into a structured filter by calling the \`query_tracks\` tool.

Rules:
- ALWAYS call \`query_tracks\`. Never respond with plain text.
- Be generous with \`genres\` expansion: if the user says "folk", consider also "psych folk", "folk rock", "indie folk", "freak folk". If they say "hip hop", consider "rap", "trap rap", "boom bap", "conscious hip hop", "experimental hip hop", "abstract hip hop", "cloud rap". If they say "metal", consider "black metal", "death metal", "post-metal", "doom metal", "sludge metal". Cast a reasonable net.
- For year-bounded queries: "songs from 2014" -> year_min=2014, year_max=2014. "2010s" -> year_min=2010, year_max=2019. "recent" -> year_min=(current_year - 2).
- For "best of" / "top" requests without a specific count, default limit to 50.
- For specific counts like "give me 100 X", set limit to 100.
- For "songs that sound like [artist]", set artist_contains; consider also nudging genres if you know the artist's lane.
- Use 'random' order_by for "give me some" / "surprise me" / "variety" intents. Otherwise default to release_year_desc.
- The explanation should be ONE sentence and read like "Showing the 30 most recent hip-hop tracks Fantano has favored since 2020."`;

export interface FilterResult {
  filter: SearchFilter;
  explanation: string;
}

export async function extractFilter(
  prompt: string,
  genreVocabulary: string[],
): Promise<FilterResult> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const vocabHint =
    genreVocabulary.length > 0
      ? `\n\nFor reference, the top genres present in the database (lowercase, use these as a hint when expanding queries):\n${genreVocabulary
          .slice(0, 120)
          .join(", ")}`
      : "";

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT + vocabHint,
    tools: [filterTool],
    tool_choice: { type: "tool", name: "query_tracks" },
    messages: [{ role: "user", content: prompt }],
  });

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
  );
  if (!toolUse) {
    throw new Error("Anthropic did not return a tool call.");
  }

  const parsed = filterSchema.safeParse(toolUse.input);
  if (!parsed.success) {
    throw new Error(`Invalid filter from LLM: ${parsed.error.message}`);
  }

  const { explanation, ...filterFields } = parsed.data;
  return {
    filter: filterFields as SearchFilter,
    explanation,
  };
}
