import { redirect } from "next/navigation";
import { searchTracks } from "@/lib/db";

export const dynamic = "force-dynamic";

/** /random returns the first FAV track from a random spin, used for "feeling lucky". */
export default async function RandomTrackPage() {
  const { rows } = await searchTracks({
    limit: 1,
    order_by: "random",
  });
  const track = rows[0];
  if (!track) {
    redirect("/");
  }
  // Bounce to the artist page since we don't have per-track detail pages yet.
  const slug = track.artist
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  redirect(`/artist/${slug}`);
}
