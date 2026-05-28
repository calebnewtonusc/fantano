export type TrackSource = "album" | "single";

export interface Track {
  uid: string;
  source: TrackSource;
  track: string;
  artist: string;
  album: string | null;
  release_year: number | null;
  label: string | null;
  genres: string[];
  video_id: string;
  video_title: string | null;
  video_url: string;
  upload_date: string | null;
}

export interface SearchFilter {
  genres?: string[];
  year_min?: number;
  year_max?: number;
  artist_contains?: string;
  album_contains?: string;
  label_contains?: string;
  source?: TrackSource;
  limit: number;
  order_by:
    | "release_year_desc"
    | "release_year_asc"
    | "upload_date_desc"
    | "random";
}

export interface SearchResponse {
  filter: SearchFilter;
  tracks: Track[];
  total: number;
  explanation: string;
}
