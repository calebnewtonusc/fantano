import OpenAI from "openai";
import { z } from "zod";
import type { SearchFilter } from "./types";

const filterSchema = z.object({
  genres: z.array(z.string()).optional(),
  similar_to_artist: z.string().optional(),
  year_min: z.number().int().min(1900).max(2100).optional(),
  year_max: z.number().int().min(1900).max(2100).optional(),
  artist_contains: z.string().optional(),
  artist_exclude: z.string().optional(),
  album_contains: z.string().optional(),
  label_contains: z.string().optional(),
  source: z.enum(["album", "single"]).optional(),
  limit: z.number().int().min(1).max(500).default(100),
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

const filterTool = {
  type: "function" as const,
  function: {
    name: "query_tracks",
    description:
      "Translate a natural-language music query into a structured filter against the Fantano FAV TRACKS database. ALWAYS call this; never reply in plain text.",
    parameters: {
      type: "object",
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
          description:
            "Substring match on artist name (case-insensitive). Use ONLY when the user wants songs BY that artist specifically. Do NOT use when the user says 'like X', 'similar to X', 'X and same genre', 'X-style', 'X-adjacent' - for those, use similar_to_artist instead.",
        },
        similar_to_artist: {
          type: "string",
          description:
            "An artist whose sonic neighborhood the user wants. The server resolves this to that artist's typical genres in Fantano's data and folds them into the genres filter. Use when the user says 'songs like X', 'X and similar artists', 'X-adjacent', 'X and friends', 'same vibe as X', 'X-style'. Do NOT also set artist_contains in that case - you want neighbors, not the same artist.",
        },
        artist_exclude: {
          type: "string",
          description:
            "Substring match on artist names to EXCLUDE. Use when the user says 'folk songs but not Bon Iver', 'hip hop excluding Drake', etc.",
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
          enum: ["album", "single"],
          description:
            "album = tracks from album/EP/mixtape reviews (carries album, release_year, label, genres). single = best tracks from Weekly Track Roundups (artist + track + year only, no album/label/genres). Omit to include both.",
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
      additionalProperties: false,
    },
  },
};

const SYSTEM_PROMPT = `You are the search backend for a site that catalogues every track Anthony Fantano (theneedledrop) has ever flagged as a FAV TRACK (in album/EP/mixtape reviews) or BEST TRACK (in Weekly Track Roundups). The data lives in two tables: \`album_tracks\` (review picks, with album + release_year + label + genres) and \`singles\` (roundup picks, artist + track + year only). The search merges both by default.

Your only job: convert the user's natural-language request into a structured filter by calling the \`query_tracks\` tool.

Rules:
- ALWAYS call \`query_tracks\`. Never respond with plain text.

- **THE BIGGEST RULE: "songs by X" is NOT the same as "songs like X".**
  - "Songs by Kendrick" / "Kendrick's stuff" / "what does Kendrick have" -> artist_contains = "Kendrick"
  - "Songs like Kendrick" / "Kendrick and similar" / "in the same genre as Kendrick" / "Kendrick-style" / "Kendrick adjacent" / "if I like Kendrick, what else?" -> similar_to_artist = "Kendrick" (DO NOT also set artist_contains)
  - The user almost always wants OTHER artists when they say "like X" or "similar to X" or "same genre as X". They want the neighborhood, not the same dot.

- Be generous with explicit \`genres\` expansion when the user names a genre:
  - "folk" -> ["folk", "psych folk", "folk rock", "indie folk", "freak folk"]
  - "hip hop" -> ["hip hop", "rap", "trap rap", "boom bap", "conscious hip hop", "experimental hip hop", "abstract hip hop", "cloud rap"]
  - "metal" -> ["black metal", "death metal", "post-metal", "doom metal", "sludge metal"]
  - "electronic" -> ["idm", "techno", "house", "ambient", "electronica", "dance"]
  - Cast a reasonable net so the result feels rich, not literal.

- "X but not Y" / "X without Y" / "X excluding Y" -> artist_exclude = "Y".

- When the user filters by genre/label/album, only album rows match (singles have no genre/label/album metadata). Don't set source explicitly in that case; the system narrows automatically.
- Use source = "single" when the user specifically wants singles / roundup picks / loose tracks / non-album cuts.
- Use source = "album" when the user specifically wants album cuts / deep album tracks.

- For year-bounded queries: "songs from 2014" -> year_min=2014, year_max=2014. "2010s" -> year_min=2010, year_max=2019. "recent" -> year_min=2024.

- DEFAULT limit is 100 when the user did not specify a count. Bump to 200-500 if the query is broad ("all the folk tracks", "give me everything by X's genre").
- For specific counts like "give me 30 X", set limit to that number exactly.

- Use 'random' order_by for "give me some" / "surprise me" / "variety" / "shuffle" intents. Otherwise default to release_year_desc.

- The explanation should be ONE sentence, plain English, like "Showing 100 hip-hop tracks Fantano has favored since 2020, ordered newest first."`;

export interface FilterResult {
  filter: SearchFilter;
  explanation: string;
}

export async function extractFilter(
  prompt: string,
  genreVocabulary: string[],
): Promise<FilterResult> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const vocabHint =
    genreVocabulary.length > 0
      ? `\n\nFor reference, the top genres present in the database (lowercase, use these as a hint when expanding queries):\n${genreVocabulary
          .slice(0, 120)
          .join(", ")}`
      : "";

  const completion = await client.chat.completions.create({
    model: "gpt-4o",
    temperature: 0,
    messages: [
      { role: "system", content: SYSTEM_PROMPT + vocabHint },
      { role: "user", content: prompt },
    ],
    tools: [filterTool],
    tool_choice: { type: "function", function: { name: "query_tracks" } },
  });

  const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
  if (!toolCall || toolCall.type !== "function") {
    throw new Error("OpenAI did not return a tool call.");
  }

  let rawArgs: unknown;
  try {
    rawArgs = JSON.parse(toolCall.function.arguments);
  } catch (err) {
    throw new Error(`OpenAI returned invalid JSON: ${(err as Error).message}`);
  }

  const parsed = filterSchema.safeParse(rawArgs);
  if (!parsed.success) {
    throw new Error(`Invalid filter from LLM: ${parsed.error.message}`);
  }

  const { explanation, ...filterFields } = parsed.data;
  return {
    filter: filterFields as SearchFilter,
    explanation,
  };
}
