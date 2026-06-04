# FANTANO-FIRST AI MUSIC CRITIC, DISCOVERY PLATFORM, AND ARTIST ADVANCE-PRESS NETWORK

## Master Product and Development Roadmap

**Owner:** Caleb Newton
**Working repository:** `calebnewtonusc/fantano`
**Document status:** Locked development reference, Version 1
**Date:** June 3, 2026
**Scope:** Extremely ambitious solo-builder roadmap designed to become a complete critic-trained music intelligence product, with AI-assisted coding and serious cloud GPU use where valuable.

---

# 0. How to Use This Document

This document is the master reference for turning the existing Fantano searchable-track project into an audio-native music platform that serves both listeners and artists. It is intentionally not a loose idea list. Each phase defines the exact product capability that must exist, the data and services required to support it, the model work to complete, the pages and APIs to ship, the validation gates that prevent building on broken foundations, and the visible demo that proves the phase is complete.

The project must be built in dependency order. Breadth and depth are both required in the end product, but breadth does not mean randomly building disconnected features. Listener discovery, artist feedback, critic prediction, playlist creation, public artist exposure, and new-review benchmarking all depend on one common foundation: a clean corpus connecting critic commentary, song and album identities, audio, embeddings, and model predictions. The first phases therefore build that foundation fast enough to create visible product wins while preserving the long-term model architecture.

This document assumes that your audio experimentation pipeline will use YouTube audio acquired through a service adapted from `yt-audio-api`, with higher-quality artist-provided audio available later for creator submissions and better training examples. Rights and compliance questions are outside the development focus of this document; use audio and text in ways consistent with the permissions you have.

---

# 1. Locked Product Vision

## 1.1 The product in one sentence

Build an AI music critic trained on thousands of pieces of real music and critic commentary that helps listeners dynamically discover and playlist music through natural-language and audio queries, while giving independent artists private pre-release feedback they can use to improve their music and optionally publish to get discovered by critics and new fans.

## 1.2 What the product is not

This is not a generic tool that uploads a song and prints compliments. It is not only a Fantano fan archive. It is not just a BPM/key detector, a mix checker, or a sound-similarity search API. It is also not a toy LLM that generates a review without evidence or measurement.

The product must be a single connected system with four mutually reinforcing experiences:

1. **The complete critical archive.** Fans can browse, search, and explore every Fantano discussion of music, including formal reviews, track roundups, rankings, lists, and mentions, with songs, albums, transcripts, scores, track reactions, comments, and audio-linked discovery.
2. **The personal listener engine.** Listeners describe what they want, upload a reference audio clip, or navigate a critical rabbit hole, and the system builds dynamic playlists and discovery paths from sound, critique, mood, review history, and their taste behavior.
3. **The artist advance-feedback studio.** Artists privately submit unreleased songs or full albums, receive rigorous critic-aligned and creator-utility feedback, compare revisions, plan releases, and optionally publish music and feedback pages that help new listeners and eventually critics find them.
4. **The measurable critic model.** For music that Fantano actually reviewed, the model can predict his likely reaction while blind to the real review, lock the prediction, reveal the actual outcome, and publicly track accuracy over time.

## 1.3 Why this wins

Generic AI song feedback is rapidly becoming commodity functionality. The durable advantage is a proprietary, continually growing dataset and product loop: music audio connected to a specific critic's published judgment, structured critique themes, listener discovery behavior, artist submissions, revisions, public reception, and future reviewers. Every new review improves evaluation. Every creator submission expands useful feedback workflows. Every public artist page grows the listener discovery library. Every playlist interaction teaches the recommendation layer what people actually want to hear.

The initial critic is Anthony Fantano because the existing repository already uses his public review ecosystem and because the breadth of discussion creates a powerful first corpus. The underlying architecture must never hard-code "Fantano" into the data model or ML system. It must treat him as `critic_id = fantano`, allowing future models for other critics, curators, producers, outlets, and audience lenses.

---

# 2. Locked Decisions from Product Discovery

The roadmap below is based on the following final decisions:

| Decision Area         | Locked Choice                                                                                                                                                                                                                                       |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product purpose       | Portfolio/research flagship, viral listener product, artist product, startup path, public accuracy benchmark, and eventual critic partnership path all matter.                                                                                      |
| Launch posture        | Combined product launch: catalog, discovery, artist uploads, and model accuracy proof must all exist in the first complete public product.                                                                                                          |
| Viral loops           | Generated playlists/discoveries, publishable artist critique pages, and model-versus-real-review share cards all matter.                                                                                                                            |
| Public positioning    | Fantano-focused initially; architecture expands to other critic/reception models later.                                                                                                                                                             |
| Initial critic corpus | Ingest every piece of Fantano commentary about a song or album, not only scored album reviews.                                                                                                                                                      |
| User priorities       | Music listeners, independent artists, and Fantano fans are initial core users.                                                                                                                                                                      |
| Listener scope        | Beautiful catalog, conversational search, dynamic playlists, audio similarity discovery, personalization, review exploration, artist trajectories, notifications, saved collections, and social sharing.                                            |
| Creator scope         | Private pre-release submission, critic-aligned written feedback, numeric creator-quality score, track reaction classification, album score prediction, strongest/weakest tracks, sequencing, revisions, public publication, and discovery exposure. |
| Album benchmark       | Upload or ingest albums Fantano reviewed, predict while blind to his real commentary, then compare against the actual review.                                                                                                                       |
| Audio corpus          | Every song or album Fantano has meaningfully commented on; expand continuously.                                                                                                                                                                     |
| Audio source          | YouTube ingestion for the experimental/review corpus using a `yt-audio-api`-style pipeline; artist upload audio for submissions.                                                                                                                    |
| Matching approach     | Fully automated, LLM-powered candidate resolution with validation and rejection rather than manual review.                                                                                                                                          |
| Audio representation  | Whole album, whole track, semantic section, 30-second window, and fine moment-level representations over time.                                                                                                                                      |
| Lyrics                | Include both fetched lyric text and audio-derived transcription when practical.                                                                                                                                                                     |
| Transcript method     | Caption extraction first where available; preserve timestamps; fallback transcription as needed.                                                                                                                                                    |
| Comments              | Initially Fantano video comments only; broader audience sources are later expansion.                                                                                                                                                                |
| Embedding store       | PostgreSQL plus pgvector first; vector interface designed so a specialized vector store can be introduced later.                                                                                                                                    |
| Budget posture        | Serious student-project budget: use GPU inference and training when it meaningfully advances the product.                                                                                                                                           |
| Builder               | Solo builder with AI assistance; roadmap is dependency-driven rather than date-driven.                                                                                                                                                              |
| Required deliverable  | Full phase roadmap, schema, monorepo structure, services, APIs, UI, ML program, benchmark system, learning path, deployment/cost plan, demo milestones, and GitHub issue-sized backlog.                                                             |

---

# 3. The Competitor-Beating Standard

## 3.1 Competitors set the minimum, not the goal

The search screenshot and prior research establish a crowded baseline. Tools such as TrackMuse, Coda, Sonar, CriticAI, and Grumpy Music claim instant or detailed feedback after a user uploads a song. Musicful, SONOTELLER, MusicCreator-style analyzers, and similar utilities focus on genre, mood, tempo, key, instruments, and structure. Mix Check Studio focuses on production and mastering diagnostics such as tonal balance, loudness, stereo width, clipping, and streaming readiness. Cyanite is a stronger infrastructure competitor because it offers audio tagging, natural-language catalog search, and audio similarity search for catalog workflows.

Your product only wins if it does all of the useful table-stakes functionality while creating a new category: **verified critic-trained feedback plus a discovery network that connects artists to listeners through publishable advance criticism.**

## 3.2 Competitive capability matrix

| Competitor category                                                     | What it already gives users                                                                                                     | Your minimum parity requirement                                                                                     | Your decisive advantage                                                                                                                                                                  |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Generic AI review tools: TrackMuse, Coda, Sonar, CriticAI               | Upload song and receive general feedback, ratings, sometimes PDF-style reports.                                                 | Upload song and receive fast, structured, attractive, actionable report with timestamped evidence.                  | Feedback is conditioned on a real critic corpus and measured against actual held-out published reviews; artists can publish the critique to reach listeners.                             |
| Persona feedback: Grumpy Music                                          | Private upload, choose A&R/producer/audio-engineer persona, scored feedback, human expert chat.                                 | Provide multiple useful feedback lenses: critic reaction, production, songwriting, listener fit, release readiness. | A real critic-specific model with blind accuracy reports; complete discovery network and pre-release publication loop rather than isolated feedback.                                     |
| Music feature analyzers: Musicful, SONOTELLER, MusicCreator-style tools | Genre, mood, key, BPM, instruments, narrative/lyric summaries.                                                                  | Surface these attributes and allow users to search or filter with them.                                             | These features drive dynamic playlisting, critic comparisons, and artist revision recommendations rather than being dead-end metadata.                                                   |
| Mix diagnostics: Mix Check Studio / RoEx-style tools                    | Technical master/mix observations such as loudness, tonal balance, clipping, width, streaming readiness.                        | Add technical production diagnostics to creator reports or integrate a specialist service later.                    | Tie technical issues to likely reception, comparable reviewed songs, version improvement, and release strategy.                                                                          |
| Catalog similarity/search: Cyanite                                      | AI tagging, free-text catalog search, audio-to-audio similarity search, segment-level matching, professional catalog workflows. | Natural-language discovery, upload/reference-track similarity, segment matching, playlist generation, filters.      | Discovery is grounded in critical context and an emerging-artist publishing network; every result can explain not only "sounds alike" but "why this might matter to you or this critic." |
| Fantano catalog: Melondy                                                | Browse scored Fantano albums visually with covers, genres, years, and review links.                                             | Match and exceed complete visual browsing, scores, genres, years, covers, and source review links.                  | Full commentary corpus, song-level reactions, transcript search, comments, audio similarity, personalized playlists, blind model forecasts, artist submissions.                          |

## 3.3 Product promises competitors must not be able to match easily

The following are non-negotiable differentiators. If a launch version does not demonstrate several of these, it is merely another AI song analyzer.

### A. Blind accuracy proof

A user can select an album that Fantano already reviewed. The system hides the real score and transcript, listens to the album, predicts the score range, favorite and least favorite tracks, and main critique themes, then reveals the published review and shows accuracy. New reviews create live, timestamped prediction events before the review result is ingested.

### B. Critic-grounded evidence rather than generic advice

Every feedback report distinguishes objective/technical observations from critic-aligned predictions and creator guidance. The report surfaces timestamped moments in the uploaded music, nearby reviewed comparisons, and the learned critique dimensions responsible for the forecast.

### C. Artist advance-press network

Artists submit unreleased music privately, choose whether to share it only with collaborators or publish it later, receive revision feedback, and convert a private report into a public release/discovery page timed to their launch. Independent artists therefore gain a version of advanced review and discovery infrastructure usually reserved for artists with publicist or critic relationships.

### D. Dynamic listener experience

Listeners do not merely view AI reviews. They generate playlists from prompts, moods, critiques, critic reactions, and uploaded sound references; save evolving taste profiles; discover unpublished or emerging artist music; and share playlist cards or model-vs-review challenges.

### E. Continually updating taste model

When Fantano publishes a new relevant video, the platform detects it, predicts the reaction from audio before ingesting the reveal where feasible, processes the transcript and track reactions, adds the verified outcome to the accuracy ledger, and later promotes a new model version through evaluation gates.

---

# 4. End-State Product Surface

The complete product is one platform with five connected spaces. These spaces should share data and user identity but can be built in phases.

## 4.1 Discover: listener home and playlist engine

The listener home page is a visually striking album-and-song discovery environment. It opens with a search prompt such as "dreamy shoegaze tracks Fantano loved with a huge final build" or "experimental hip hop albums rated highly where production mattered more than lyrics." Search results include albums, tracks, artists, critic snippets, playlists, and publishable independent-artist submissions where appropriate. A listener can also upload a reference clip or select a song as an audio seed and generate a dynamic playlist from sonically and critically relevant results.

The listener product includes saved listening queues, generated playlist pages, cover-grid exploration, artist trajectories, review alerts, personal taste summaries, shareable cards, and eventually following creators. The retention loop is simple: a user discovers good music, saves or shares the resulting playlist, trains their personal taste profile through actions, and returns for new recommendations and new reviewed releases.

## 4.2 Archive: complete Fantano knowledge base

The archive contains every relevant Fantano content unit: scored album reviews, unscored reviews, EPs, mixtapes, compilations, track roundups, YUNOREVIEW, ranking/list videos, classic reviews, year-end lists, decade-end lists, shorts, livestream segments where tractable, interviews or podcasts imported later, and every extracted music mention. Each release page includes metadata, review sources, review score where applicable, favorite/least favorite track reactions, transcript-linked critique sections, audience comments summary, comparable works, and relevant model predictions.

This archive replaces the existing two-table `album_tracks` and `singles` data model with a flexible representation of sources, works, mentions, reactions, and evidence. It is the foundational dataset for the listener and ML products.

## 4.3 Studio: artist advance feedback and publishing

The artist studio supports private song and album submissions. An artist uploads a private track or multi-track project, states goals such as "lead single," "raw demo," "master candidate," or "choosing between two versions," and chooses feedback lenses. The system produces a critic-aligned reception forecast, a creator-quality score, track-reaction classification, technical observations, songwriting/production insights, timestamped evidence, comparable critical history, recommended changes, and a clear confidence statement.

For album uploads, the studio adds predicted project rating, favorite/least-favorite candidates, track-by-track notes, cohesion and sequencing analysis, strongest single selection, tracks to revise or cut, and release-readiness assessment. Artists can upload later versions and compare whether changes improved the forecast and the system's reasoning.

The most important product distinction is publication. A private submission remains private until the artist chooses otherwise. When ready, an artist can publish a release page containing artwork, bio, song preview/full playback controls as supported, critique highlights, launch date, and links. Listeners can discover published artist releases alongside the broader discovery experience, and later critics or curators can browse opted-in advance submissions.

## 4.4 Bench: model accuracy and public challenge experience

The Bench space makes the model credible and entertaining. Users choose an already-reviewed album or wait for a newly detected review event. The system generates a blind forecast before revealing published outcomes. It then displays predicted score, actual score, predicted and actual track reactions, matching critique dimensions, mistakes, confidence, and model-version history.

This creates a viral loop that generic tools do not have: users can share "The AI guessed Fantano's review" cards, challenge the model, explore its biggest wins or fails, and watch its accuracy change over time.

## 4.5 Admin/Lab: ingestion, model, and corpus operations

The internal admin area is essential even for a solo project. It provides pipeline status, video classification, extracted mentions, audio candidate matching, processing failures, embedding coverage, dataset versions, benchmark results, model promotion controls, creator submission processing status, and visibility/privacy controls. Because you do not want manual verification of every audio match, the admin interface exists primarily for auditing exceptions, monitoring confidence, and correcting failures discovered after automation.

---

# 5. Product Flywheel

The product should be designed around one reinforcing loop rather than isolated tools.

A new Fantano video is detected and classified. Music mentions, transcript segments, score or track reactions, comments, and relevant audio are processed into the corpus. The current model attempts a blind forecast when possible and its result becomes public benchmark evidence. The archive becomes richer, making listener search and playlists more engaging. Listeners discover music, including public submissions from emerging artists. Artists see a channel for both feedback and exposure, submit private releases, revise their work, and optionally publish reports and releases. Those public releases attract listeners and provide additional creator/product feedback data. As more critics are later added, artists gain multiple feedback lenses and listeners gain richer discovery pathways.

This flywheel determines priority: every early engineering decision should support corpus quality, discovery utility, artist trust, and measurable prediction rather than building ornamental features disconnected from the loop.

---

# 6. Existing Repository Baseline and Upgrade Strategy

## 6.1 Current state

The existing repository is already a useful starting point. Its README describes a Python `uv` worker that uses `yt-dlp` and `psycopg`, runs a daily Railway cron, fetches YouTube descriptions from `theneedledrop`, parses album-review `FAV TRACKS` and Weekly Track Roundup best tracks, then syncs into Railway Postgres. The database currently uses two logical tables, `album_tracks` and `singles`. A Next.js 16 web app with Tailwind and a shadcn-style UI exposes `/api/search`, where Anthropic Sonnet extracts a structured search filter and executes a SQL union over the two tables.

This current product is not discarded. It becomes the first importer into a normalized archive. The existing favorite-track data is valuable as an initial validated slice of song reactions and as immediate content for listener pages while the full review corpus is being built.

## 6.2 Migration principle

Do not rewrite the entire application in one step. Create the new normalized schema alongside the old tables, write a migration/import job from the old structures into the new corpus, switch new pages to read from the normalized schema, then retire old reads only after result parity is verified. The old pipeline remains runnable during the migration so that current functionality never disappears while the product expands.

---

# 7. Technical Architecture Decision

## 7.1 Chosen architecture

The first full architecture uses a monorepo deployed as separately scalable services:

| Layer                          | Chosen technology                                                                      | Reason                                                                                                                                             |
| ------------------------------ | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| User-facing web application    | Next.js + TypeScript + Tailwind                                                        | Preserves the existing web app and supports public pages, dashboards, server routes, and shareable pages.                                          |
| Data/ML language               | Python with `uv`                                                                       | Preserves the existing worker and is natural for audio processing, inference, training, and evaluation.                                            |
| Primary database               | PostgreSQL on Railway                                                                  | Existing infrastructure; relational joins matter for reviews, users, predictions, jobs, and filters.                                               |
| Vector search                  | `pgvector` extension in PostgreSQL                                                     | Audio/text embeddings stay joinable to tracks, reviews, permissions, submissions, and benchmark exclusions.                                        |
| Object storage                 | Cloudflare R2                                                                          | Store normalized audio, uploads, artwork snapshots if needed, reports, and generated exports without growing Railway volumes.                      |
| Background jobs                | PostgreSQL-backed job queue implemented in Python using `FOR UPDATE SKIP LOCKED`       | Minimizes early infrastructure and keeps jobs inspectable; easy to run as Railway worker services.                                                 |
| GPU inference/batch embeddings | Modal initially                                                                        | Useful for solo-builder batch and on-demand GPU jobs without managing permanent GPU machines. Re-benchmark against RunPod/Lambda when usage grows. |
| Text LLM abstraction           | Provider adapter supporting current Anthropic usage and alternative models             | Used for extraction, resolution, critique generation, and playlist explanation; do not couple business logic to one model.                         |
| Audio acquisition              | Internal YouTube Audio Adapter derived from `yt-audio-api` plus creator direct uploads | Separates reviewed-corpus audio retrieval from creator uploads.                                                                                    |
| Authentication                 | Supabase Auth or Clerk, select during creator phase                                    | Catalog is public; artist submission and personalization require accounts.                                                                         |
| Analytics                      | PostHog when public user flows begin                                                   | Required for retention and viral-loop measurement.                                                                                                 |
| Error monitoring               | Sentry for web and Python services                                                     | Needed once async processing and uploads exist.                                                                                                    |

## 7.2 Why Postgres plus pgvector, not Pinecone initially

Every vector query needs relational controls. Discovery results require joins to artists, releases, scores, critique segments, visibility, and playlist history. Creator comparisons must exclude private submissions owned by others. Blind evaluation must exclude review text and labels from the tested release. Postgres plus pgvector keeps these rules enforceable in one queryable system. Pinecone can be introduced later behind a `VectorStore` interface if scale proves it necessary, but it should not be the starting dependency.

## 7.3 Required model-service abstraction

All ML outputs must be versioned. Nothing should be stored as "the embedding" or "the review prediction" without recording model name, model version, input asset version, generated time, and task type. The product must be able to compare old and new models, reproduce benchmark results, and show which model generated a public prediction.

---

# 8. Monorepo Structure

Keep the existing repository and expand it into the following structure. This gives one source of truth while separating product, pipeline, and model responsibilities clearly.

```text
fantano/
├── README.md
├── MASTER_ROADMAP.md                         # this document in the repo
├── .env.example
├── docker-compose.local.yml                  # local Postgres + pgvector + optional services
├── apps/
│   └── web/                                  # existing Next.js application, expanded
│       ├── app/
│       │   ├── (public)/
│       │   │   ├── page.tsx                 # listener/discover home
│       │   │   ├── archive/
│       │   │   ├── releases/[slug]/
│       │   │   ├── artists/[slug]/
│       │   │   ├── playlists/[id]/
│       │   │   ├── published/[slug]/        # public emerging artist release pages
│       │   │   └── bench/
│       │   ├── (auth)/
│       │   ├── studio/
│       │   │   ├── upload/
│       │   │   ├── submissions/[id]/
│       │   │   ├── projects/[id]/
│       │   │   └── publish/[id]/
│       │   └── admin/
│       ├── components/
│       ├── lib/
│       └── tests/
├── packages/
│   ├── db/                                   # SQL migrations, TypeScript DB queries, shared types
│   │   ├── migrations/
│   │   ├── schema/
│   │   └── queries/
│   ├── contracts/                            # JSON schemas shared between Python and TypeScript
│   └── ui/                                   # reusable components later
├── services/
│   ├── corpus/                               # Python ingestion and extraction service
│   │   └── src/corpus/
│   │       ├── youtube_catalog.py
│   │       ├── classify_video.py
│   │       ├── parse_review.py
│   │       ├── transcript.py
│   │       ├── comments.py
│   │       ├── entities.py
│   │       └── jobs.py
│   ├── audio/                                # YouTube resolver, downloader, preprocessing
│   │   └── src/audio_pipeline/
│   │       ├── sources/
│   │       │   ├── youtube_adapter.py
│   │       │   └── upload_adapter.py
│   │       ├── candidate_search.py
│   │       ├── llm_resolver.py
│   │       ├── download.py
│   │       ├── normalize.py
│   │       ├── fingerprint.py
│   │       ├── segment.py
│   │       └── feature_extract.py
│   ├── ml/                                   # embeddings, prediction, generation, training, evaluation
│   │   └── src/music_intelligence/
│   │       ├── embeddings/
│   │       ├── baselines/
│   │       ├── critic_model/
│   │       ├── generator/
│   │       ├── evaluation/
│   │       ├── datasets/
│   │       └── serving/
│   └── worker/                               # shared job runner/container entrypoints
├── infra/
│   ├── railway/
│   ├── modal/
│   └── storage/
├── scripts/
│   ├── migrate_legacy_tracks.py
│   ├── seed_dev_data.py
│   └── export_benchmark.py
├── data/                                     # gitignored local cached samples only
└── reports/
    ├── benchmark/
    ├── model_cards/
    └── corpus_stats/
```

The existing `src/fantano/` code can initially be moved or imported into `services/corpus/` only after new tests preserve its behavior. Do not begin by reorganizing folders for aesthetic reasons alone; each move must correspond to the new pipeline or a migration task.

---

# 9. Core Database Schema

## 9.1 Schema principles

The database has to support four different forms of truth. First, a music entity such as an artist, release, or track exists independent of any critic. Second, a content source such as a YouTube video contains commentary and extracted mentions. Third, audio assets and embeddings represent sound and may have multiple sources or processing/model versions. Fourth, model outputs and user actions represent predictions, reports, playlists, and feedback loops. These cannot be forced into the current two-table shape.

Use UUID primary keys for durable entities, normalized strings plus aliases for matching, JSONB for model payloads that will change, and explicit status fields for every asynchronous process. Store no vector without its embedding model version, no prediction without a dataset/model version, and no blind forecast without a leak-prevention lock record.

## 9.2 Entity tables

### `critics`

Stores the critic or reception lens. Seed with Fantano now; add additional critics and non-person lenses later.

```sql
id UUID PRIMARY KEY
slug TEXT UNIQUE NOT NULL                 -- 'fantano'
display_name TEXT NOT NULL                -- 'Anthony Fantano'
source_name TEXT                          -- 'theneedledrop'
model_enabled BOOLEAN DEFAULT TRUE
created_at TIMESTAMPTZ NOT NULL
```

### `artists`

```sql
id UUID PRIMARY KEY
canonical_name TEXT NOT NULL
normalized_name TEXT UNIQUE NOT NULL
slug TEXT UNIQUE NOT NULL
bio TEXT
image_url TEXT
external_ids JSONB DEFAULT '{}'
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

### `artist_aliases`

```sql
id UUID PRIMARY KEY
artist_id UUID REFERENCES artists(id)
alias TEXT NOT NULL
normalized_alias TEXT NOT NULL
source TEXT
UNIQUE(normalized_alias, artist_id)
```

### `releases`

A release is an album, EP, mixtape, compilation, or standalone single project.

```sql
id UUID PRIMARY KEY
primary_artist_id UUID REFERENCES artists(id)
title TEXT NOT NULL
normalized_title TEXT NOT NULL
slug TEXT UNIQUE NOT NULL
release_type TEXT NOT NULL                -- album, ep, mixtape, compilation, single
release_date DATE
release_year INTEGER
label TEXT
genres TEXT[] DEFAULT '{}'
cover_url TEXT
external_ids JSONB DEFAULT '{}'
metadata_confidence NUMERIC
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
UNIQUE(primary_artist_id, normalized_title, release_type)
```

### `tracks`

```sql
id UUID PRIMARY KEY
release_id UUID REFERENCES releases(id)
primary_artist_id UUID REFERENCES artists(id)
title TEXT NOT NULL
normalized_title TEXT NOT NULL
track_number INTEGER
disc_number INTEGER DEFAULT 1
duration_ms INTEGER
is_standalone BOOLEAN DEFAULT FALSE
genres TEXT[] DEFAULT '{}'
external_ids JSONB DEFAULT '{}'
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
UNIQUE(release_id, disc_number, track_number)
```

### `track_artists`

Supports features and collaborations.

```sql
track_id UUID REFERENCES tracks(id)
artist_id UUID REFERENCES artists(id)
role TEXT DEFAULT 'performer'
PRIMARY KEY(track_id, artist_id, role)
```

## 9.3 Source and review tables

### `source_videos`

This table stores every Fantano video found by the catalog worker before deciding what content type it represents.

```sql
id UUID PRIMARY KEY
critic_id UUID REFERENCES critics(id)
platform TEXT NOT NULL DEFAULT 'youtube'
external_video_id TEXT UNIQUE NOT NULL
channel_id TEXT
channel_name TEXT
title TEXT NOT NULL
description TEXT
published_at TIMESTAMPTZ
url TEXT NOT NULL
duration_seconds INTEGER
thumbnail_url TEXT
content_type TEXT                      -- album_review, track_roundup, yunoreview, list, short, livestream, other
classification_confidence NUMERIC
processing_status TEXT DEFAULT 'discovered'
raw_payload JSONB
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

### `reviews`

A review connects a source video to one principal reviewed release or song. A list or roundup may contain many `review_mentions` without a single principal review.

```sql
id UUID PRIMARY KEY
critic_id UUID REFERENCES critics(id)
source_video_id UUID REFERENCES source_videos(id)
release_id UUID REFERENCES releases(id)
track_id UUID REFERENCES tracks(id)
review_type TEXT NOT NULL                -- scored_release, unscored_release, single_reaction, list_mention
numeric_score NUMERIC                    -- nullable
score_scale INTEGER DEFAULT 10
verdict_label TEXT                       -- loved, liked, meh, disliked, mixed, not_scored
review_date DATE
extraction_confidence NUMERIC
human_verified BOOLEAN DEFAULT FALSE
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

### `review_mentions`

Captures every artist/release/track comment regardless of whether it is a formal scored review.

```sql
id UUID PRIMARY KEY
critic_id UUID REFERENCES critics(id)
source_video_id UUID REFERENCES source_videos(id)
review_id UUID REFERENCES reviews(id)
artist_id UUID REFERENCES artists(id)
release_id UUID REFERENCES releases(id)
track_id UUID REFERENCES tracks(id)
mention_type TEXT NOT NULL               -- discussed, praised, criticized, best_track, worst_track, ranked, recommended
reaction_label TEXT                      -- loved, liked, meh, disliked, neutral, uncertain
start_ms INTEGER
end_ms INTEGER
source_text TEXT
extraction_confidence NUMERIC
created_at TIMESTAMPTZ NOT NULL
```

### `review_track_reactions`

```sql
id UUID PRIMARY KEY
review_id UUID REFERENCES reviews(id)
track_id UUID REFERENCES tracks(id)
reaction TEXT NOT NULL                   -- favorite, least_favorite, praised, criticized, mentioned, inferred
confidence NUMERIC
basis TEXT                               -- description, transcript, list, model_extraction
created_at TIMESTAMPTZ NOT NULL
UNIQUE(review_id, track_id, reaction, basis)
```

### `transcript_segments`

```sql
id UUID PRIMARY KEY
source_video_id UUID REFERENCES source_videos(id)
segment_index INTEGER NOT NULL
start_ms INTEGER NOT NULL
end_ms INTEGER NOT NULL
text TEXT NOT NULL
transcript_source TEXT NOT NULL           -- youtube_caption, whisper, manual
linked_track_id UUID REFERENCES tracks(id)
linked_release_id UUID REFERENCES releases(id)
link_confidence NUMERIC
critique_labels JSONB DEFAULT '{}'
sentiment_label TEXT
created_at TIMESTAMPTZ NOT NULL
UNIQUE(source_video_id, segment_index, transcript_source)
```

### `source_comments`

```sql
id UUID PRIMARY KEY
source_video_id UUID REFERENCES source_videos(id)
external_comment_id TEXT UNIQUE NOT NULL
author_name TEXT
text TEXT NOT NULL
like_count INTEGER
published_at TIMESTAMPTZ
reply_count INTEGER
sentiment_label TEXT
agreement_label TEXT                      -- agrees, disagrees, neutral, unrelated, uncertain
mentioned_track_id UUID REFERENCES tracks(id)
analysis_payload JSONB
created_at TIMESTAMPTZ NOT NULL
```

## 9.4 Audio and embedding tables

### `audio_candidates`

Every song/audio resolution begins with candidate generation; no downloaded audio should be treated as canonical without a resolver record.

```sql
id UUID PRIMARY KEY
track_id UUID REFERENCES tracks(id)
release_id UUID REFERENCES releases(id)
query_text TEXT NOT NULL
candidate_video_id TEXT NOT NULL
candidate_url TEXT NOT NULL
title TEXT
channel_name TEXT
duration_ms INTEGER
is_official_channel BOOLEAN
is_topic_channel BOOLEAN
metadata_score NUMERIC
llm_resolution_score NUMERIC
validation_status TEXT DEFAULT 'pending'  -- pending, accepted, rejected, abstained, superseded
resolution_reason TEXT
created_at TIMESTAMPTZ NOT NULL
```

### `audio_assets`

```sql
id UUID PRIMARY KEY
track_id UUID REFERENCES tracks(id)
release_id UUID REFERENCES releases(id)
source_type TEXT NOT NULL                 -- youtube, creator_upload, direct_file
source_external_id TEXT
source_url TEXT
storage_key_original TEXT                 -- nullable if source deleted after normalized copy
storage_key_normalized TEXT               -- retained for approved/training/active corpus
format TEXT
sample_rate_hz INTEGER
channels INTEGER
duration_ms INTEGER
sha256 TEXT
audio_fingerprint TEXT
resolver_confidence NUMERIC
processing_status TEXT DEFAULT 'queued'
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

### `audio_segments`

```sql
id UUID PRIMARY KEY
audio_asset_id UUID REFERENCES audio_assets(id)
segment_type TEXT NOT NULL                -- full_track, album, fixed_30s, fixed_5s, verse, chorus, bridge, intro, outro
segment_index INTEGER NOT NULL
start_ms INTEGER NOT NULL
end_ms INTEGER NOT NULL
section_label TEXT
section_confidence NUMERIC
storage_key TEXT
created_at TIMESTAMPTZ NOT NULL
UNIQUE(audio_asset_id, segment_type, segment_index)
```

### `embedding_models`

```sql
id UUID PRIMARY KEY
name TEXT NOT NULL                         -- muq, mert, text-embedding, music-flamingo-feature
version TEXT NOT NULL
modality TEXT NOT NULL                     -- audio, text, joint
dimension INTEGER NOT NULL
config JSONB
created_at TIMESTAMPTZ NOT NULL
UNIQUE(name, version)
```

### `audio_embeddings`

The vector dimension is specified once the initial selected encoder is run. Use a migration when selecting the model; do not create incompatible mixed dimensions in one column.

```sql
id UUID PRIMARY KEY
audio_segment_id UUID REFERENCES audio_segments(id)
embedding_model_id UUID REFERENCES embedding_models(id)
embedding VECTOR(<selected_dimension>) NOT NULL
created_at TIMESTAMPTZ NOT NULL
UNIQUE(audio_segment_id, embedding_model_id)
```

### `text_embeddings`

```sql
id UUID PRIMARY KEY
entity_type TEXT NOT NULL                  -- transcript_segment, review_summary, comment, playlist_prompt
entity_id UUID NOT NULL
embedding_model_id UUID REFERENCES embedding_models(id)
embedding VECTOR(<selected_dimension>) NOT NULL
created_at TIMESTAMPTZ NOT NULL
UNIQUE(entity_type, entity_id, embedding_model_id)
```

## 9.5 Creator and discovery tables

### `users`

```sql
id UUID PRIMARY KEY
auth_provider_id TEXT UNIQUE NOT NULL
username TEXT UNIQUE
role TEXT DEFAULT 'listener'              -- listener, artist, admin
profile JSONB DEFAULT '{}'
created_at TIMESTAMPTZ NOT NULL
```

### `artist_profiles`

```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
display_name TEXT NOT NULL
bio TEXT
links JSONB DEFAULT '{}'
profile_image_url TEXT
is_public BOOLEAN DEFAULT FALSE
created_at TIMESTAMPTZ NOT NULL
```

### `creator_projects`

```sql
id UUID PRIMARY KEY
artist_profile_id UUID REFERENCES artist_profiles(id)
title TEXT NOT NULL
project_type TEXT NOT NULL                 -- single, ep, album, demo
intent TEXT
release_date DATE
visibility TEXT DEFAULT 'private'         -- private, unlisted, public, scheduled
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

### `creator_submissions`

```sql
id UUID PRIMARY KEY
project_id UUID REFERENCES creator_projects(id)
track_title TEXT NOT NULL
track_number INTEGER
version_number INTEGER NOT NULL DEFAULT 1
supersedes_submission_id UUID REFERENCES creator_submissions(id)
audio_asset_id UUID REFERENCES audio_assets(id)
artist_prompt TEXT                         -- desired goals/context
processing_status TEXT DEFAULT 'uploaded'
created_at TIMESTAMPTZ NOT NULL
```

### `critique_reports`

```sql
id UUID PRIMARY KEY
submission_id UUID REFERENCES creator_submissions(id)
model_version_id UUID REFERENCES model_versions(id)
critic_id UUID REFERENCES critics(id)
report_type TEXT NOT NULL                  -- song, album, comparison, release_readiness
creator_quality_score NUMERIC
predicted_reaction TEXT                    -- loved, liked, meh, disliked
predicted_album_score NUMERIC
confidence NUMERIC
summary TEXT
payload JSONB NOT NULL                     -- structured output
visibility TEXT DEFAULT 'private'
created_at TIMESTAMPTZ NOT NULL
```

### `published_releases`

```sql
id UUID PRIMARY KEY
project_id UUID REFERENCES creator_projects(id)
slug TEXT UNIQUE NOT NULL
public_title TEXT NOT NULL
public_description TEXT
cover_url TEXT
critic_report_id UUID REFERENCES critique_reports(id)
publish_at TIMESTAMPTZ
status TEXT DEFAULT 'draft'               -- draft, scheduled, published, hidden
created_at TIMESTAMPTZ NOT NULL
```

### `saved_items`, `collections`, `playlists`, `playlist_tracks`, `user_taste_events`

These support consumer retention. `user_taste_events` stores behavior such as saving a track, skipping a playlist result, opening a review, following an artist, sharing a card, or replaying a published emerging artist song. Store the event type and entity identifiers rather than prematurely creating a giant personalization schema.

## 9.6 Model, dataset, and evaluation tables

### `datasets`

```sql
id UUID PRIMARY KEY
name TEXT NOT NULL
version TEXT NOT NULL
description TEXT
cutoff_date DATE
manifest_storage_key TEXT
created_at TIMESTAMPTZ NOT NULL
UNIQUE(name, version)
```

### `dataset_members`

```sql
id UUID PRIMARY KEY
dataset_id UUID REFERENCES datasets(id)
release_id UUID REFERENCES releases(id)
track_id UUID REFERENCES tracks(id)
audio_asset_id UUID REFERENCES audio_assets(id)
review_id UUID REFERENCES reviews(id)
split TEXT NOT NULL                        -- train, validation, temporal_holdout, live_blind
leakage_blocked BOOLEAN DEFAULT FALSE
created_at TIMESTAMPTZ NOT NULL
```

### `model_versions`

```sql
id UUID PRIMARY KEY
model_family TEXT NOT NULL                 -- metadata_baseline, muq_predictor, multimodal_generator
version TEXT NOT NULL
training_dataset_id UUID REFERENCES datasets(id)
config JSONB NOT NULL
artifact_storage_key TEXT
status TEXT DEFAULT 'experimental'        -- experimental, candidate, production, retired
created_at TIMESTAMPTZ NOT NULL
UNIQUE(model_family, version)
```

### `blind_predictions`

```sql
id UUID PRIMARY KEY
model_version_id UUID REFERENCES model_versions(id)
critic_id UUID REFERENCES critics(id)
release_id UUID REFERENCES releases(id)
source_video_id UUID REFERENCES source_videos(id)      -- nullable before reveal
prediction_payload JSONB NOT NULL
prediction_locked_at TIMESTAMPTZ NOT NULL
revealed_review_id UUID REFERENCES reviews(id)
revealed_at TIMESTAMPTZ
is_live_prediction BOOLEAN DEFAULT FALSE
leakage_audit JSONB NOT NULL
created_at TIMESTAMPTZ NOT NULL
```

### `evaluation_runs`

```sql
id UUID PRIMARY KEY
model_version_id UUID REFERENCES model_versions(id)
dataset_id UUID REFERENCES datasets(id)
task TEXT NOT NULL                         -- score, track_reaction, favorite_rank, critique_labels, report_usefulness
metrics JSONB NOT NULL
notes TEXT
created_at TIMESTAMPTZ NOT NULL
```

## 9.7 Jobs table

```sql
id UUID PRIMARY KEY
job_type TEXT NOT NULL
entity_type TEXT
entity_id UUID
payload JSONB DEFAULT '{}'
status TEXT DEFAULT 'queued'              -- queued, running, succeeded, failed, retrying, dead_letter
priority INTEGER DEFAULT 100
attempts INTEGER DEFAULT 0
max_attempts INTEGER DEFAULT 3
locked_by TEXT
locked_at TIMESTAMPTZ
run_after TIMESTAMPTZ DEFAULT NOW()
error_message TEXT
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

Workers claim work using `SELECT ... FOR UPDATE SKIP LOCKED`, update status idempotently, and emit new downstream jobs only when the corresponding entity has not already been processed for the relevant version.

---

# 10. Exact Background Job Graph

The platform is an asynchronous processing system. A public page should never wait while a video transcript, album audio, or GPU embedding job processes. The app displays processing states and updates when output is ready.

## 10.1 Fantano archive ingestion graph

```text
scan_critic_channel
  -> upsert_source_video
  -> classify_source_video
  -> fetch_video_description
  -> extract_principal_review_and_mentions
  -> resolve_artist_release_track_entities
  -> fetch_transcript
  -> segment_transcript
  -> extract_score_and_track_reactions
  -> link_transcript_segments_to_tracks
  -> extract_critique_labels
  -> fetch_top_comments
  -> analyze_comment_signals
  -> discover_tracklist_for_referenced_release
  -> create_audio_resolution_jobs
```

## 10.2 Audio acquisition and processing graph

```text
resolve_audio_candidates
  -> llm_select_audio_candidate
  -> validate_selected_candidate
      -> if high confidence: download_audio
      -> if insufficient confidence: generate_alternative_queries_and_retry
      -> if unresolved: mark_abstained_and_exclude_from_training
  -> normalize_audio
  -> fingerprint_audio
  -> segment_audio
  -> extract_basic_audio_features
  -> generate_audio_embeddings
  -> enable_audio_similarity_search
  -> add_to_dataset_candidate_pool
```

## 10.3 Creator upload graph

```text
create_private_project
  -> create_presigned_upload
  -> upload_received
  -> normalize_audio
  -> fingerprint_audio
  -> segment_audio
  -> extract_features_and_embeddings
  -> retrieve_comparable_reviewed_music
  -> generate_critic_forecast
  -> generate_creator_utility_report
  -> display_private_report
  -> optional_upload_new_version
  -> compare_versions
  -> optional_publish_release_page
  -> enter_listener_discovery_pool
```

## 10.4 New-review blind benchmark graph

```text
new_review_video_detected
  -> identify_referenced_release_without_reading_outcome_fields
  -> obtain_audio_or_existing_audio_asset
  -> run_production_model_in_blind_mode
  -> lock_prediction_record
  -> ingest_transcript_and_actual_review_outcome
  -> reveal_prediction_comparison
  -> update_public_accuracy_dashboard
  -> enqueue_for_next_training_dataset_version, not immediate production retrain
```

The blind benchmark pipeline must have strict "do not read outcome" boundaries. It should use release identity and audio only before locking the prediction. If score, transcript, favorite tracks, comment reaction, or downstream text is already in the database for that release, the job must create a leakage audit that explicitly confirms those records were filtered out during the forecast.

---

# 11. Phase 0: Stabilize the Current App and Prepare the New Foundation

## Objective

Preserve the working favorite-track search while converting the repository into a maintainable foundation for the much larger product. This phase produces no flashy model yet, but it avoids the common failure mode of stacking audio jobs and UI features on top of a fragile two-table database.

## What to build

Start by snapshotting the current behavior. Add tests around the current parsing outputs for a small set of representative album reviews and Weekly Track Roundups. Add a simple database migration system rather than relying only on applying a raw schema on every worker run. Enable pgvector in the development and Railway databases. Create the new schema tables for critics, artists, releases, tracks, sources, reviews, mentions, and jobs. Seed `critics` with Fantano and write a migration importer that copies the current `album_tracks` and `singles` into normalized entities while retaining links back to the originating YouTube video.

The public app should continue to return the existing smart search results, but create a new hidden `/archive-v2` route that reads normalized tables. Once the same favorite tracks appear in both systems, the normalized database becomes the source of truth and legacy tables are marked read-only.

Create the initial service boundaries, shared JSON contracts, error tracking, local development database, and worker runner. This is also where environment names are separated: `development`, `staging`, and `production`. Audio/model experiments should never write experimental rows into production without a model/version label.

## Required technical tasks

| Workstream          | Required implementation                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------ |
| Database            | Enable pgvector; add migrations; create core entities and jobs tables; add indexes; seed critic.             |
| Legacy migration    | Import existing `album_tracks` and `singles`; deduplicate artists/releases/tracks; retain source provenance. |
| Worker architecture | Implement Postgres job claimant, retry logic, idempotency keys, job logging.                                 |
| Web app             | Add archive-v2 hidden grid and release detail page skeleton using new schema.                                |
| Testing             | Snapshot parser tests, migration count assertions, duplicate entity tests, basic route tests.                |
| Operations          | `.env.example`, staging deployment, Sentry setup, corpus stats command.                                      |

## Learning before building

Learn PostgreSQL normalization, migration workflows, and pgvector basics before touching embeddings. Build a toy table with five fake tracks and vectors, run nearest-neighbor queries with relational filters, and only then enable the extension in the real schema. Learn the `FOR UPDATE SKIP LOCKED` pattern by implementing a local job worker that safely runs the same queue from two terminal windows without duplicating jobs.

## Completion gate

Phase 0 is complete only when the original search behavior still works, normalized tables contain the existing favorite/best-track dataset with source provenance, new migrations run cleanly from an empty database, and workers can claim/retry jobs without duplication.

## Visible demo

Show the original app working and an internal `Archive V2` page rendering the same tracks through the normalized data model, with a corpus stats panel showing artists, releases, tracks, reviews, and source videos.

---

# 12. Phase 1: Build the Melondy-Plus Critical Archive

## Objective

Deliver the first product users can love immediately: a beautiful, comprehensive Fantano browsing and search experience that matches basic scored-album browsing and begins surpassing it through track reactions, source context, and conversational filtering.

## What to build

Expand ingestion from only favorite tracks to formal review records and release metadata. The archive worker should scan Fantano channel video metadata, classify relevant video titles into review types, extract release identity and numeric scores from description/title patterns where present, and create one release page per reviewed work. Album artwork, release year, genres, label, and outbound music links are enriched through selected metadata sources. Use MusicBrainz/Discogs or another reliable metadata layer as a canonical identity source where practical, while preserving source-specific fields in JSONB.

The public archive should be cover-driven and fast. It should support score filtering, year filtering, genre filtering, release type filtering, search by artist or album, sorting by score/date/alphabetical, and release detail pages. Each release page should show review score where known, original review video link, favorite/best tracks already available, and a timeline placeholder for transcript critique that will be filled in Phase 2.

The current LLM query search should be expanded to answer queries over releases, not only tracks. A query such as "highly rated experimental pop albums from the late 2010s" should result in an explicit parsed filter and browsable cards, not only prose.

## Pages to ship

| Page               | Functionality                                                                                                                             |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                | Discover-first landing page with archive grid, smart query box, newest reviews, high-score browsing, and coming-soon artist upload entry. |
| `/archive`         | Full cover grid with filters, sort controls, pagination/infinite scroll, and data coverage stats.                                         |
| `/releases/[slug]` | Cover, artist, score, genres, review video, favorite/least-favorite placeholder, related releases, save button.                           |
| `/artists/[slug]`  | Discography timeline, reviewed releases, average scores, track mentions, future trajectory chart shell.                                   |
| `/search?q=`       | Search results across tracks, releases, artists, source videos.                                                                           |

## APIs to ship

```text
GET  /api/archive/releases?score_min=&score_max=&year=&genre=&type=&sort=&cursor=
GET  /api/archive/releases/:id
GET  /api/archive/artists/:id
GET  /api/archive/stats
POST /api/search/structured           { query }
GET  /api/sources/videos/:id
POST /api/admin/corpus/scan
POST /api/admin/corpus/reprocess/:videoId
```

## Completion gate

Do not move to audio/model functionality until the archive displays a stable corpus of formal Fantano-reviewed releases, has reliable source-video links, handles duplicates cleanly, and makes it easy to identify gaps. Your archive does not need every transcript or audio asset yet, but it must make the incomplete records visible as pipeline statuses rather than silently missing data.

## Visible demo

A listener can browse Fantano-reviewed releases visually, search "best noisy rock albums rated 8 or higher," open a release, see its score and favorites, and follow the source review link. This should already be a better day-to-day experience than a simple album-score grid because the database includes track-level reactions and conversational search.

---

# 13. Phase 2: Ingest Every Relevant Commentary Source, Transcript, Track Reaction, and Comment

## Objective

Turn a visual archive into the text-and-label corpus required for critic intelligence. The system should now know not just that an album was reviewed, but what was said, when it was said, which song it referred to, and which evaluative dimensions were praised or criticized.

## Content coverage

The ingestion classifier must recognize and process all of the following content categories:

| Content type                               | Data to extract                                                                                           |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Scored album/EP/mixtape/compilation review | Principal release, score, date, favorite/least favorite tracks, transcript segments, critique dimensions. |
| Unscored review                            | Release, verdict/reaction, transcript, songs mentioned, critique dimensions.                              |
| Weekly Track Roundup                       | Every song discussed, best/meh/worst-style reaction where expressed, timestamped segment.                 |
| YUNOREVIEW                                 | Each release or song mentioned and concise reaction.                                                      |
| Classic review                             | Release and commentary, flagged as retrospective context.                                                 |
| Ranked list / worst-to-best                | Ranked objects, order, positive/negative mentions, source context.                                        |
| Year-end and decade-end lists              | Placement and commentary.                                                                                 |
| Shorts / short-form reaction               | Track/release mention, reaction, transcript if music-related.                                             |
| Livestream/interview/podcast material      | Add only once the main video corpus is stable; store as a lower-confidence commentary source.             |

## Transcript pipeline

Use available timestamped YouTube captions as the first transcript source. Store raw transcript segments exactly as received, then create normalized merged passages for analysis. If a relevant video lacks usable captions, enqueue a transcription job using Whisper or an equivalent speech-to-text model. Every segment retains source type, time bounds, raw text, and processing version.

The LLM extraction job receives a bounded group of timestamped transcript segments plus identified release/track candidates. It must return structured JSON linking each passage to one or more tracks or to the overall project, labeling sentiment and critique dimensions. The data contract should require confidence and evidence text. Low-confidence links remain in the database but are excluded from supervised training until confidence improves through automated reconciliation.

## Critique taxonomy V1

Use a stable first taxonomy instead of letting the LLM invent labels. Every review passage can receive zero or more labels in these categories:

| Dimension               | Positive examples                             | Negative examples                       |
| ----------------------- | --------------------------------------------- | --------------------------------------- |
| Production and mix      | textured, punchy, spacious, detailed          | muddy, flat, overcompressed, lifeless   |
| Composition/songwriting | strong progression, memorable hook, payoff    | repetitive, directionless, underwritten |
| Lyrics/themes           | vivid, focused, emotionally honest            | shallow, cliched, incoherent            |
| Vocal/performance       | expressive, charismatic, technically strong   | weak delivery, monotonous, grating      |
| Originality/influence   | fresh, distinctive, well-integrated influence | derivative, trend-chasing, imitation    |
| Cohesion/sequencing     | coherent, paced, meaningful arc               | bloated, inconsistent, poorly sequenced |
| Energy/dynamics         | satisfying build, groove, contrast            | stagnant, no climax, exhausting         |
| Experimentation         | bold and successful                           | messy, unjustified, gimmicky            |
| Emotional impact        | moving, immersive, replayable                 | emotionally empty, forgettable          |
| Accessibility/replay    | immediate, addictive, compelling              | inaccessible without payoff, disposable |

## Comments pipeline

For each Fantano video, initially fetch a bounded but useful number of top comments and replies where available. Start with top 100 comments ordered by relevance/likes so that analysis is cheap enough to run over the whole archive; keep the API configurable so top 500 can later be processed for important releases. The LLM labels comments as agreement, disagreement, track preference, repeated criticism, joke/meme, or unrelated. Comments do not define the critic model target; they create a separate audience-context layer for release pages and later audience prediction.

## Search expansion

Once transcript and critique labels exist, users must be able to search concepts rather than metadata. Queries such as "albums where he loved the sound but criticized the lyrics," "favorite tracks with explosive endings," or "records he described as bloated" should retrieve transcript evidence and linked releases.

## Completion gate

Phase 2 is complete when the archive contains timestamped transcripts and structured critique labels for a substantial validated subset, and the ingestion pipeline can process newly discovered videos without manual authoring. The first minimum gold subset should be at least 100 formal reviews spanning multiple genres and score levels, because this is large enough to catch extraction failures before scaling audio processing across the entire archive.

## Visible demo

Open any gold-set release page and see score, track reactions, a structured "what he liked / what he criticized" summary, clickable timestamped evidence, and audience comment themes. Search for a critique concept and receive releases plus source evidence.

---

# 14. Phase 3: Automated YouTube Audio Asset Factory with LLM Resolution

## Objective

Acquire and process the audio needed for sound-based discovery and critic-model training at scale, without relying on manual matching. This phase transforms text-linked tracks and releases into actual analyzable sound assets.

## Audio source architecture

The referenced `yt-audio-api` repository is a lightweight Flask service using `yt-dlp` and FFmpeg. It accepts a public YouTube URL, downloads the best audio, converts to MP3 at 192 kbps, and returns expiring token access while cleaning temporary files. Do not adopt its API unchanged as the product architecture. Use its downloader/conversion logic as the initial `YouTubeAudioAdapter` behind your own job-controlled asset service.

Your service needs additional capabilities: candidate search, LLM-based candidate resolution, storage into R2, checksum/fingerprint generation, normalized audio formats, track-versus-album handling, job idempotency, failure states, segment generation, and model-ready metadata.

## YouTube candidate resolution system

You do not want to manually check matches. Therefore, the correct engineering solution is not "take the first result." It is an automated resolver that is allowed to abstain instead of poisoning the training dataset.

For every track or release requiring audio, generate several search queries, such as canonical artist and track name, artist and album name plus "full album," official audio terms, and Topic-channel patterns. Gather candidate metadata: video title, channel, description, duration, view context, playlist association where available, and whether the channel appears official or auto-generated. When a release has a known tracklist and durations, compute expected album duration and expected track-duration constraints.

An LLM resolution step then receives the canonical target and candidate evidence, and returns: selected candidate, asset type, confidence, reason, and rejection flags. It must strongly favor exact title and artist matches, official/Topic uploads, credible full-album videos for album assets, and duration agreement. It must reject reaction videos, slowed/reverb versions, live versions unless the intended work is live, covers, instrumentals when the target is original, remixes unless the target is that remix, lyric videos only if audio is otherwise correct, duplicates, and wrong editions.

After the LLM selects a candidate, run deterministic validation. Verify duration boundaries, normalize title tokens, compare candidate metadata, check for duplicated audio fingerprints against previously resolved tracks, and where an album has both a full-album asset and individual track assets, compare segment fingerprints. If validation does not support the selection, automatically search again with alternative query templates. If still unresolved, mark `abstained`; the asset is not included in training or benchmark evaluation until later automatic resolution succeeds.

This is how the product approaches "LLM-powered so matching errors do not happen": it is not blind confidence; it is automatic selection plus deterministic checks plus abstention.

## Storage decision: override needed for the dream model

The earlier preference to keep only embeddings after processing is acceptable for simple search but incompatible with your stated ambition to train and improve audio-based models over time. New encoders, new segmentation methods, fine-tuning, album-level modeling, and evaluation reproduction require retaining model-ready audio. Therefore, store normalized audio for the training/benchmark corpus and active creator submissions in object storage. You may delete transient original download files after normalization and hashing, but keep a normalized audio asset and processing manifest. This is the minimum storage choice consistent with the project goal.

Use the following audio representations:

| Asset type                  | Storage purpose                                                                |
| --------------------------- | ------------------------------------------------------------------------------ |
| Original temporary download | Retained only during ingestion/debug lifecycle unless explicitly valuable.     |
| Normalized track audio      | Retained for every accepted track; standard format/sample rate for processing. |
| Normalized album audio      | Retained where the model uses full-album sequencing/cohesion.                  |
| Derived segments            | Generate on demand or cache high-use windows; retain manifest always.          |
| Audio embeddings/features   | Retained in Postgres/pgvector per model version.                               |

## Audio processing standard

The first normalized format should be consistent enough for feature extraction while reasonably storage-efficient. Store a normalized processing copy in a lossless or high-quality compressed format selected after a cost check; do not repeatedly transcode from compressed excerpts during model experiments. Generate waveform statistics, duration, sample rate, loudness features, and acoustic fingerprints. Segment into whole-track representations, fixed 30-second windows with overlap, fine 5-second moment windows for timestamp evidence, and structural sections later when section-detection quality is dependable.

## Album ingestion behavior

Because you want both whole-album and individual-track understanding, the pipeline should support both. Where individual official/Topic tracks resolve confidently, those tracks become the primary track-level assets. Where a single full-album upload resolves more cleanly, ingest it as a release-level asset and split into tracks using the canonical tracklist and timestamp evidence. When both exist, preserve both and use fingerprint/length comparison as automated quality validation.

## APIs and worker jobs

```text
POST /api/admin/audio/resolve/:trackId
POST /api/admin/audio/resolve-release/:releaseId
GET  /api/admin/audio/assets?status=&confidence=
GET  /api/admin/audio/assets/:id
POST /api/admin/audio/assets/:id/retry
POST /api/admin/audio/assets/:id/exclude

Jobs:
resolve_track_audio_candidates
resolve_release_audio_candidates
llm_judge_audio_candidates
validate_audio_candidate
download_youtube_audio
upload_normalized_asset
fingerprint_audio
segment_audio_asset
extract_audio_features
```

## Completion gate

Do not train critic predictors on audio until the audio resolver is demonstrably reliable on the gold corpus. Automatically resolve at least the 100 gold-set reviews, create a failure/abstention report, and manually inspect only a small audit sample for the purpose of assessing the automated system, not as a permanent product workflow. Training must consume only accepted/high-confidence assets, while abstained items remain tracked gaps.

## Visible demo

Select a reviewed album, display the automatically resolved audio assets, show the exact candidate rationale and confidence, play or preview the relevant source where supported, show track/segment waveforms and processed status, and prove that the same audio is ready for embedding and blind benchmarking.

---

# 15. Phase 4: Embeddings, Sound Search, and Dynamic Listener Discovery

## Objective

Build functionality that immediately beats metadata-only catalog tools: search by sound, search by natural language over sound plus criticism, generate coherent playlists, and let users discover music through audio moments and critic context.

## Embedding model plan

Use MuQ as the primary music embedding candidate because it is purpose-built for music representation learning. Evaluate MERT as a baseline so you can prove whether MuQ produces better similarity and predictive features in your corpus. Use a text embedding model for transcript and query indexing. Use Music Flamingo or another capable audio-language model to generate descriptive structured observations, but do not depend on slow long-form generation for every retrieval query.

For each accepted audio track, generate whole-track embeddings and segment embeddings. For each review transcript passage, generate text embeddings. Build separate indexes for audio and text, then create hybrid retrieval that combines structured metadata filters, critic labels, text semantic similarity, and audio similarity.

## Vector storage and indexing

Implement pgvector tables and HNSW indexes after the initial dimension is known for the selected embedding model. Store embeddings with model versions and segment references. Every search request specifies which embedding model/version produced its candidates. This avoids silent result changes when models improve.

## Listener experiences to ship

### Natural-language critical discovery

A listener enters a prompt such as "melancholy indie tracks with warm guitars that Fantano liked but that still feel accessible." The system parses intent into metadata and critique filters, embeds the descriptive audio intent where supported, retrieves matching tracks/releases/transcript evidence, and creates a playlist with a short explanation for each inclusion.

### Audio reference discovery

A listener uploads an audio clip or selects an existing track as a seed. The system returns sonically similar reviewed tracks and, when available, public artist submissions. It highlights similar moments at the segment level and explains critic context: whether the comparison track was praised, criticized, a favorite, or part of a high-rated record.

### Dynamic playlists

Playlist generation is not a static list of search results. It must support prompts that imply pacing, contrast, or storytelling: "start sleepy, become euphoric, end abrasive," "ten tracks like this chorus but progressively more experimental," or "a gym playlist made only from highly praised tracks." Use embeddings plus metadata and critique constraints to select candidates, then a sequencing layer to order energy and diversity.

### Taste profile and retention

Users can save albums, save tracks, generate playlists, replay results, and dismiss bad recommendations. Record these interactions as taste events. Do not build a complex recommendation model immediately; first use saved artist/genre/critic-reaction preferences to personalize prompt suggestions and rerank results.

## APIs to ship

```text
POST /api/discovery/text                 { prompt, filters?, user_id? }
POST /api/discovery/audio                { audio_upload_id | seed_track_id, filters? }
POST /api/playlists/generate             { prompt, seed_tracks?, target_length, arc? }
GET  /api/playlists/:id
POST /api/playlists/:id/save
POST /api/taste/events                   { event_type, entity_type, entity_id }
GET  /api/users/me/taste-profile
GET  /api/tracks/:id/similar
```

## Evaluation gate

Similarity search cannot be judged solely by "it looks cool." Create a small evaluation set in which human evaluators rate whether retrieved tracks are meaningfully similar to seed tracks and whether generated playlists satisfy prompts. Compare MuQ against MERT and a metadata-only baseline. The production model is the one that wins human usefulness and latency tradeoffs, not the one with the fanciest name.

## Visible demo

Upload a reference song or select a Fantano favorite track, retrieve similar moments from other reviewed tracks, generate a dynamic playlist, open each track's critic context, save the playlist, and share a visually appealing playlist page.

---

# 16. Phase 5: Artist Advance-Submission Studio and Publish-to-Discovery Loop

## Objective

Build the key artist wedge: private, useful pre-release feedback for independent artists, followed by optional publication into a listener-facing discovery network. This is how the product becomes meaningfully better than instant feedback apps.

## Product philosophy

Independent artists often seek feedback before release through peers, curators, bloggers, or private communities, but most do not have access to major critics or formal advance press. Your product should give them a serious private feedback loop before they finalize a master or release strategy, then create an optional pathway to exposure. Feedback is not only a verdict; it is a release tool.

## Private submission workflow

An artist creates a profile and a private project. For a song, they upload audio, add artwork optionally, enter title/genre/release intention, and answer a short intent prompt: what stage the song is in, what they want feedback on, whether it is intended as a single or album track, and whether they want an uncompromising critic prediction, creator-development advice, or both. For an album, they upload ordered tracks and give project context.

By default every submission is private. The processing pipeline creates audio features and embeddings and returns status until the first report is available. Users can delete or replace a private project, and can create new versions for comparison. Publish controls are separate from analysis controls: publishing never happens accidentally.

## Song feedback report requirements

A song report must include both your chosen outputs: a critic-style reaction category and a numeric creator utility/quality score. It must include:

| Section                  | Required content                                                                             |
| ------------------------ | -------------------------------------------------------------------------------------------- |
| Headline forecast        | Loved / liked / meh / disliked-style reaction prediction, creator-quality score, confidence. |
| What is working          | Three to five precise strengths grounded in timestamps.                                      |
| What is holding it back  | Three to five risks or weaknesses grounded in timestamps.                                    |
| Audio map                | Key moments such as hook, energy shifts, static sections, standout production details.       |
| Comparison shelf         | Similar tracks or passages from the reviewed/public discovery corpus, with explanation.      |
| Improvement plan         | Specific suggested revisions ranked by likely impact.                                        |
| Intent alignment         | Whether the track succeeds at the stated artistic goal, even if critic prediction is mixed.  |
| Publish decision support | Whether it seems ready to share, needs revision, or should be tested in another version.     |

## Album feedback report requirements

The album report must go much further than a combined song report. It includes predicted critic score range, track reaction rankings, strongest single recommendation, tracks likely to be favorites or weakest points, sequencing and pacing analysis, cohesion map, repeated weaknesses across tracks, songs to revise or possibly cut, comparison releases, and a release-readiness summary. It should also allow the creator to click into any track for the full song report.

## Version comparison workflow

Every artist project can have multiple uploaded versions. When an artist uploads a revision, the system creates a comparison report that shows changes in predicted critic reception, creator-quality score, energy structure, identified timestamps, mix observations, and recommendation resolution. The key question is not just "which is higher scored?" but "which specific revision changed the result and why?"

This version loop becomes valuable product data: track which recommendations were acted on, which revisions artists mark as useful, and which version they ultimately publish.

## Public publishing workflow

Artists can turn a private submission into a public discovery page. They choose which report excerpts to show, upload public artwork and artist information, set a release date or publish immediately, select whether audio playback is full/preview/link-out, and create a public page. Public pages appear in emerging artist discovery surfaces and can be used in dynamic playlists after publication. In later phases, critics/curators can browse opted-in advance pages before release.

## Pages to ship

| Page                               | Functionality                                                                      |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| `/studio`                          | Artist dashboard: projects, processing, drafts, published pages, feedback history. |
| `/studio/upload`                   | Private upload and intent form.                                                    |
| `/studio/projects/[id]`            | Project view, track versions, album order, reports, publish controls.              |
| `/studio/submissions/[id]/report`  | Full critique report with timestamps and comparisons.                              |
| `/studio/submissions/[id]/compare` | Version comparison.                                                                |
| `/studio/publish/[projectId]`      | Create/schedule public artist page.                                                |
| `/published/[slug]`                | Listener-facing release page and critique highlights.                              |
| `/discover/emerging`               | Public opted-in artist discovery feed.                                             |

## APIs to ship

```text
POST /api/studio/projects
POST /api/studio/uploads/presign
POST /api/studio/submissions
GET  /api/studio/submissions/:id/status
GET  /api/studio/submissions/:id/report
POST /api/studio/submissions/:id/reprocess
POST /api/studio/submissions/:id/versions
POST /api/studio/projects/:id/compare
POST /api/studio/projects/:id/publish
POST /api/studio/projects/:id/schedule-release
GET  /api/discover/emerging
GET  /api/published/:slug
```

## Completion gate

Phase 5 is complete when an independent artist can privately upload a song, receive an evidence-grounded report, upload a changed version, understand the difference, and choose to publish a discovery page. Conduct a small beta with real musicians and require usefulness feedback in the app. The product must learn whether reports change decisions, not merely whether they look polished.

## Visible demo

An artist uploads a private unreleased song, receives a timestamped report and comparable reviewed songs, uploads a revised mix, sees improvement analysis, schedules a public release page, and a listener then discovers that published track in a dynamically generated playlist.

---

# 17. Phase 6: Build the Research-Grade Training Dataset and Blind Benchmark

## Objective

Create the exact evaluation structure that turns "AI review tool" claims into evidence. Before generating a convincing Fantano-style review, prove what aspects of critic response are actually predictable from audio and allowable contextual inputs.

## Dataset design

Create versioned dataset manifests with tracks/releases, audio asset versions, transcript/reaction targets, inclusion status, split assignment, and leakage filters. The dataset must include all processed Fantano commentary in the corpus, but supervised tasks should distinguish source quality: formal scored release reviews provide strongest score targets; explicit favorite/least favorite lines provide strongest track labels; casual or list mentions provide weaker reaction targets; comments remain an audience layer rather than a Fantano ground truth.

## Required dataset splits

| Split                       | Purpose                                                                       | Input restrictions                                                                                |
| --------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Training                    | Learn critic-aligned prediction and critique labels.                          | Audio plus review labels/text from training time window.                                          |
| Validation                  | Choose model/hyperparameters.                                                 | No use for final reported performance.                                                            |
| Historical temporal holdout | Evaluate on later reviews already known to the app but hidden from the model. | Audio/metadata only at prediction time; no real review text, score, reaction labels, or comments. |
| Live blind queue            | Measure future performance when newly published review content appears.       | Prediction locked before result ingestion.                                                        |
| Creator usefulness set      | Measure whether feedback helps artists.                                       | Private uploads and human feedback, separate from critic accuracy.                                |

## Leakage prevention

The largest credibility risk is accidentally feeding the real answer back into the predictor. Every blind prediction request must execute through a restricted query layer that blocks transcript segments, reviews, reaction labels, source comments, playlist data derived from the reviewed result, and text embeddings connected to the held-out release. Store a `leakage_audit` payload showing which tables and records were excluded. If an album is in the holdout set, all tracks from that album are excluded from training for album-level tests.

## Baseline tasks and metrics

| Task                                         | Baseline                             | Main metric              | Secondary metrics                                        |
| -------------------------------------------- | ------------------------------------ | ------------------------ | -------------------------------------------------------- |
| Predict album score                          | Global mean, genre/year linear model | Mean absolute error      | Within +/-1 score, Spearman correlation, calibration.    |
| Predict track reaction                       | Majority class, metadata classifier  | Macro F1                 | Precision/recall by reaction.                            |
| Rank favorite track within album             | Random/order baseline                | Hit@1 / Hit@3            | Mean reciprocal rank.                                    |
| Rank least-favorite track                    | Random/order baseline                | Hit@1 / Hit@3            | Mean reciprocal rank.                                    |
| Predict critique dimensions                  | Frequency baseline                   | Macro F1                 | Per-dimension precision/recall.                          |
| Generate report matching main talking points | Retrieval-only baseline              | Human rubric score       | Semantic overlap as supporting only, evidence grounding. |
| Creator usefulness                           | No-feedback control where possible   | Artist usefulness rating | Revision uptake, publish rate.                           |

## Model-vs-real public interface

The Bench UI should display blind predictions without implying perfection. It shows model version, input mode, locked timestamp, score forecast range, reaction predictions, confidence, and generated critique themes. Once actual review outcome is available, the page reveals comparisons. A share card can highlight a hit ("predicted 8; actual 8; identified favorite track") or an honest miss ("predicted positive; actual negative; here is what the model missed"). Mistakes build trust if they are visible and the model improves.

## Completion gate

Do not claim a critic prediction model publicly until at least metadata-only and audio-embedding baselines have been evaluated on a temporal holdout set with reproducible manifests. The public product can show "experimental prediction" before performance is strong, but the app must display model version and actual measured evaluation metrics.

## Visible demo

Choose reviewed albums from a held-out set, run blind predictions, reveal actual scores and track reactions, and display a dashboard comparing baselines against the audio-aware model.

---

# 18. Phase 7: Train the Fantano-Aligned Prediction System V1

## Objective

Build a legitimate multi-task critic model that listens to music, forecasts track and album reaction, identifies the likely reasons, and powers creator reports. The first serious model should be rigorous, interpretable, and cheaper to train than attempting to build an audio foundation model from scratch.

## Model progression

### Experiment A: Metadata-only baselines

Use release type, genre, year, track count, artist prior review aggregates, and duration statistics. This does not create a valuable final model, but it establishes how much score signal can be guessed without hearing music. It is the bar the audio models must clearly beat.

### Experiment B: Pretrained audio embedding predictors

Generate MuQ and MERT representations for whole tracks and aggregate album representations. Train lightweight supervised heads: gradient boosting or a small neural MLP for score/reaction classification, and a ranking model for favorite/least-favorite prediction. Compare embedding families on the same held-out split. This is the first meaningful answer to the research question: does sound carry signal about critic response beyond metadata?

### Experiment C: Segment-attentive album model

A full album cannot be represented only by averaging track vectors. Build a model that consumes ordered track embeddings and selected segment embeddings, with track position and duration features, then predicts album score, favorite/least-favorite track distributions, cohesion, pacing, and repeated critique dimensions. This powers album reports and sequencing feedback.

### Experiment D: Critique-dimension prediction

Use structured transcript labels as targets. Predict whether a critic would likely praise or criticize production, songwriting, lyrics, vocals, originality, cohesion, energy, experimentation, emotional impact, and replay value. This layer is more useful to artists than a single score because it explains which dimension drives the forecast.

### Experiment E: Retrieval-grounded report generation

Do not immediately fine-tune a generator to imitate writing. First create a report generator that takes: audio-derived structured observations, prediction-head outputs, confidence, similar reviewed audio passages, allowed review-language exemplars from training only, and artist intent. A text LLM composes a neutral but sharp report in a structured format with evidence timestamps. For public Fantano benchmark mode it can use a critic-aligned voice without claiming to be the critic; for creator utility mode it prioritizes actions over entertainment.

### Experiment F: Multimodal fine-tuning research branch

Only after the earlier experiments prove signal should you investigate adapting an audio-language model using approved audio/text pairs. Music Flamingo is an important candidate for detailed music reasoning; Qwen audio/omni variants can be tested for interactive experiences; MuQ/MERT remain representation baselines. This branch should be judged against the retrieval-grounded system, not assumed superior because it is more impressive technically.

## Input/output contract

### Single song output

```json
{
  "track_reaction": "liked",
  "reaction_probabilities": {
    "loved": 0.18,
    "liked": 0.51,
    "meh": 0.24,
    "disliked": 0.07
  },
  "creator_quality_score": 7.2,
  "confidence": 0.63,
  "critique_dimensions": {
    "production": { "direction": "positive", "confidence": 0.8 },
    "songwriting": { "direction": "mixed", "confidence": 0.6 },
    "originality": { "direction": "negative", "confidence": 0.47 }
  },
  "timestamped_evidence": [],
  "comparisons": [],
  "revision_actions": []
}
```

### Full album output

```json
{
  "predicted_score": 7.4,
  "score_interval": [6.5, 8.0],
  "confidence": 0.58,
  "favorite_track_rankings": [],
  "least_favorite_track_rankings": [],
  "track_reports": [],
  "cohesion": {},
  "sequencing": {},
  "strongest_single": {},
  "revision_priority": [],
  "release_readiness": {},
  "written_review": ""
}
```

## Completion gate

Promote a model into public critic prediction only if it beats the metadata baseline on held-out score and/or reaction tasks and produces reports judged useful by actual artists. If score prediction remains weak but critique usefulness is high, be honest in the product: foreground creator feedback while displaying score forecasts as experimental.

## Visible demo

A held-out album receives a blind model score, favorite-track ranking, critique-dimension forecast, and generated report; the actual review is revealed; a creator uploads an unreleased song and receives the same underlying intelligence adapted into actionable feedback.

---

# 19. Phase 8: Full Album Creator Studio, Release Planning, and Publishable Advance Reviews

## Objective

Make the creator product something artists would choose before releasing an album, rather than a novelty used once. The platform should now emulate the value of advance feedback and early critical discovery without requiring an artist to already know powerful critics or outlets.

## Album workflow

Artists upload ordered albums or EPs, optionally include multiple master versions, describe intended narrative and single candidates, and receive a project-level report. The product displays album pacing as a timeline, predicted track reactions, cohesion and repetition issues, likely standout tracks, single recommendation, track ordering suggestions, and revision priority. It supports moving tracks in a proposed sequence and rerunning sequence-level analysis without requiring new audio uploads.

## Advance publication controls

A creator can keep the entire project private, share a private unlisted report link with collaborators, schedule a public critique page on release day, or opt in to a future curated/critic discovery queue. Before publication, the artist chooses what becomes visible: audio previews, full songs, cover art, report sections, revision story, release links, and contact/social information.

## Discovery integration

Published artist releases are not hidden in a separate marketplace. They become eligible for listener queries such as "new independent artists making textured dream pop with emotionally direct lyrics" and playlist generation, clearly identified as artist submissions rather than Fantano-reviewed works. This creates a genuine exposure opportunity: feedback becomes distribution.

## Quality safeguards

Artist-public pages should display the nature of the review: AI-generated feedback based on a critic-aligned model, model version, and whether the track is a private-to-public submission. Do not let generated praise become meaningless marketing; reports should retain concrete criticism and artist control over publication.

## Completion gate

Recruit real artists and observe whether they submit full projects or return with versions, whether they choose to publish, and whether listeners click/save/play emerging artist tracks found through discovery. The platform wins only if artists feel helped and listeners find music they genuinely like.

---

# 20. Phase 9: Viral Consumer Product and Personal Music Experience

## Objective

Make listeners return frequently, share results naturally, and discover both known reviewed music and new artist releases through a product that feels personal rather than archival.

## Core consumer loops

### Playlist prompt loop

A listener enters a highly specific emotional or critical request, receives an immediately playable/exportable playlist with explanations, saves it, shares a visual card, and returns to generate the next one. Prompt history becomes an editable discovery journal.

### Audio seed loop

A listener uploads or selects a song they love, explores close sound matches with critic context, follows an artist or saves a playlist, and gradually builds a personalized taste profile.

### Model challenge loop

A fan chooses a reviewed record, guesses Fantano's score themselves, sees the AI prediction locked beside their own guess, reveals the actual result, and shares a comparison card. New review events create repeated attention.

### Emerging artist loop

A listener discovers a published artist submission through a playlist or feed, hears the song, sees concise critique/context, follows or shares the artist, and helps independent music surface through meaningful matching rather than ad buying.

## Features to add

| Surface        | Features                                                                                                                |
| -------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Discover feed  | Prompt starter cards, new reviews, model challenges, high-quality emerging releases, personalized rows.                 |
| Playlist pages | Editable prompt, sequencing, explanation, export/listen options, save/share, remix playlist prompt.                     |
| Taste profile  | Preferred sonic attributes, critic-context interests, saved genres, artist discovery history, evolving recommendations. |
| Social sharing | Album forecast cards, playlist cards, emerging release cards, "model got it right/wrong" cards.                         |
| Notifications  | New Fantano reviews, followed artist releases, new model challenge result, new playlists matching saved themes.         |
| Collections    | User-made album/track/artist collections and themed public discovery pages.                                             |

## Product metrics

| Goal              | Metric                                                                                                |
| ----------------- | ----------------------------------------------------------------------------------------------------- |
| Viral sharing     | Share-card creation rate; visits originating from share links.                                        |
| Discovery utility | Playlist save rate; track click/listen-out rate; repeat playlist generation.                          |
| Retention         | Weekly returning listeners; notification return rate; saved-user retention.                           |
| Artist impact     | Plays/saves/follows for published creator releases; creator publish rate; creator repeat submissions. |
| Model trust       | Bench page repeat visits; accuracy page interactions; prediction share rate.                          |

## Completion gate

This phase is complete only when listeners use the platform for repeated discovery, not merely to inspect an interesting AI demo, and when opted-in artists demonstrably receive discovery interactions from listener surfaces.

---

# 21. Phase 10: Continuous New Review Detection, Live Forecasting, and Controlled Retraining

## Objective

Make the platform feel alive and make every new Fantano review a product event and evaluation opportunity.

## Update process

The source-video scanner runs frequently enough that a new relevant Fantano video appears rapidly in the system. The crucial logic is ordering: identify the likely reviewed release and acquire available audio before exposing the real outcome fields to the predictor. Run the production model, save a locked prediction, then process transcript/score/track reactions and reveal the comparison. If an outcome cannot be concealed because it appears directly in title or metadata, mark the event ineligible for a pure live-blind result while still ingesting it into the archive.

Retraining must not happen automatically after every outcome. Automatically ingest new data and update benchmark statistics, then build candidate dataset versions at scheduled checkpoints. A new model is trained and evaluated against fixed historical and accumulated live holdouts. Only promote it after it improves key metrics or artist usefulness; otherwise keep the existing production model.

## Admin dashboard requirements

The admin area shows new source discovery, extraction status, unresolved audio assets, locked blind predictions, review reveals, performance drift by recent reviews, model training candidates, creator-processing queue, and failures. Build alerting for dead-letter jobs and for unusually low confidence in new audio or extraction pipelines.

## Completion gate

A new review must move from detection to archive entry automatically, and where eligible it must produce a publicly timestamped blind model comparison. Dataset and model versions must remain reproducible after continuous updates.

---

# 22. Phase 11: Multi-Critic and Multi-Reception Expansion

## Objective

Turn a powerful Fantano-first product into a general critical and music-discovery platform.

## Architecture requirement from day one

Every table and endpoint that refers to critic judgments must accept `critic_id`. Critique reports should accept a `lens_id` that can represent a critic, an A&R-style model, producer feedback, a fan-community prediction, or a listener-segment model. This avoids rebuilding the product when expansion begins.

## Expansion model

Future critics or outlets bring new commentary corpora, labels, and output structures. A Pitchfork-like lens may emphasize written reviews rather than track reactions; a producer lens may prioritize mix and arrangement; fan-community lenses may emphasize polarizing reactions or replay value. The product should let artists compare lenses rather than believe one verdict is universal.

## Completion gate

Do not expand publicly until the Fantano-first system proves value through active listener discovery, creator usage, and transparent model measurement. Expansion should multiply a working product, not distract from finishing it.

---

# 23. Exact API Surface by Domain

## 23.1 Archive and search API

```text
GET  /api/archive/releases
GET  /api/archive/releases/:releaseId
GET  /api/archive/tracks/:trackId
GET  /api/archive/artists/:artistId
GET  /api/archive/critics/:criticId
GET  /api/archive/videos/:videoId
GET  /api/archive/releases/:releaseId/evidence
GET  /api/archive/releases/:releaseId/comments-summary
POST /api/search/structured
POST /api/search/critique
```

## 23.2 Discovery and playlists API

```text
POST /api/discovery/audio-upload/presign
POST /api/discovery/audio-search
POST /api/discovery/text-search
GET  /api/tracks/:trackId/similar
POST /api/playlists/generate
PATCH /api/playlists/:playlistId
POST /api/playlists/:playlistId/save
POST /api/playlists/:playlistId/share-card
GET  /api/users/me/collections
POST /api/users/me/collections
POST /api/users/me/taste-events
GET  /api/users/me/taste-profile
```

## 23.3 Artist studio API

```text
POST /api/studio/profile
POST /api/studio/projects
PATCH /api/studio/projects/:projectId
POST /api/studio/uploads/presign
POST /api/studio/submissions
GET  /api/studio/submissions/:submissionId
GET  /api/studio/submissions/:submissionId/report
POST /api/studio/submissions/:submissionId/new-version
POST /api/studio/projects/:projectId/album-analysis
POST /api/studio/projects/:projectId/version-comparison
POST /api/studio/projects/:projectId/publish
PATCH /api/studio/published/:publishedId
GET  /api/discover/emerging
```

## 23.4 Bench and model API

```text
GET  /api/bench/models
GET  /api/bench/leaderboard
GET  /api/bench/challenges
POST /api/bench/historical/:releaseId/predict
GET  /api/bench/predictions/:predictionId
POST /api/bench/predictions/:predictionId/reveal
GET  /api/bench/live-events
GET  /api/bench/evaluations/:modelVersionId
```

## 23.5 Admin/processing API

```text
POST /api/admin/sources/scan
GET  /api/admin/sources/videos
POST /api/admin/sources/:videoId/reprocess
GET  /api/admin/jobs
POST /api/admin/jobs/:jobId/retry
GET  /api/admin/audio/candidates
GET  /api/admin/audio/assets
POST /api/admin/audio/assets/:assetId/retry-resolution
POST /api/admin/datasets/build
POST /api/admin/models/train
POST /api/admin/models/:modelVersionId/evaluate
POST /api/admin/models/:modelVersionId/promote
GET  /api/admin/dashboard
```

---

# 24. UI Map and Experience Requirements

## 24.1 Listener home page

The home page must immediately communicate both sides of the product without feeling crowded. The primary hero contains a dynamic music discovery prompt and an audio-seed upload option. Directly below it are three living modules: newly reviewed music and active model challenges, generated playlist/discovery examples, and promising published artist releases. A secondary call-to-action invites artists to receive pre-release feedback.

## 24.2 Archive page

The archive must feel like an album-cover browsing product rather than a database admin view. Use a dense cover wall with powerful filters, quick score/reaction overlays, hover details, and responsive navigation into release pages. It should always be obvious whether a release has full transcript/audio/model coverage or is still being processed.

## 24.3 Release page

A release page unifies metadata, criticism, audio discovery, and benchmarking. It includes cover and score; source review links; favorite/least favorite tracks; critique summaries with evidence timestamps; related sound matches; audience comment themes; playlist-generation actions; and, if held out or live-predicted, a model-versus-actual panel.

## 24.4 Studio report page

The creator report must be beautiful enough to publish and specific enough to revise from. It needs an interactive waveform/timeline with evidence flags, a clear high-level verdict, collapsible analysis dimensions, comparison tracks, prioritized revision cards, and next actions: upload a new version, share privately, publish later, or create an album project.

## 24.5 Public artist release page

A publishable release page should feel like an editorial discovery artifact, not a raw AI log. It includes the artist's chosen presentation, playback/link controls, release date, selected critique excerpts, comparison context, playlist-add action, follow/share actions, and clear indication that feedback is AI-generated. It should serve both the artist's exposure and listener discovery.

## 24.6 Bench page

The Bench page is the proof and entertainment layer. It should have model leaderboards, newest live challenges, largest hits/misses, genre-level performance, a "try a reviewed album" action, and shareable reveal cards. It should make improving model quality interesting to follow over time.

---

# 25. Machine Learning Program in Build Order

## 25.1 Do not begin with giant fine-tuning

The first goal is not to train a giant audio language model. It is to prove that the corpus has learnable critic signal, that retrieval and embeddings work, and that artist reports are useful. Foundation models provide music/audio representations; your unique work is corpus building, supervised objectives, benchmark design, report grounding, and user feedback loops.

## 25.2 Required experiments sequence

| Experiment                    | Model/input                                | Purpose                             | Ship criterion                                      |
| ----------------------------- | ------------------------------------------ | ----------------------------------- | --------------------------------------------------- |
| E0 Metadata score baseline    | Genre/year/artist history/release metadata | Establish no-audio baseline.        | Reproducible benchmark metrics.                     |
| E1 MuQ similarity retrieval   | Whole-track + segment embeddings           | Ship listener audio discovery.      | Human similarity preference beats metadata search.  |
| E2 MERT comparison retrieval  | Same corpus/splits as E1                   | Select embedding model empirically. | Choose based on quality/latency.                    |
| E3 Audio score predictor      | MuQ/MERT aggregates + small predictor      | Test critic score learnability.     | Beat E0 on temporal holdout.                        |
| E4 Track reaction classifier  | Track embeddings + context                 | Predict loved/liked/meh/disliked.   | Useful macro F1 and calibrated confidence.          |
| E5 Favorite-track ranker      | Tracks grouped per album                   | Predict favorite/least favorite.    | Beat random/order baselines Hit@K.                  |
| E6 Critique-label predictor   | Audio + structured targets                 | Explain forecast dimensions.        | Sufficient F1 on useful dimensions.                 |
| E7 Retrieval-grounded report  | Predictions + evidence + LLM               | Produce artist-facing report.       | Artists rate feedback actionable.                   |
| E8 Ordered album model        | Track sequence + segments                  | Album score/cohesion/sequencing.    | Improve album tasks and artist utility.             |
| E9 Multimodal fine-tune       | Audio-language model adaptation            | Research leap if worthwhile.        | Beats E7/E8 on defined metrics.                     |
| E10 Continual model candidate | New review batches                         | Update taste model safely.          | Must pass fixed and live holdouts before promotion. |

## 25.3 Models to evaluate

| Model/tool                    | Role in system                                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------------- |
| MuQ / MuQ-MuLan               | Primary candidate for music embeddings and similarity/prediction features.                        |
| MERT                          | Comparison baseline for acoustic music representations.                                           |
| Music Flamingo                | Long-form music understanding and structured observations; candidate for deeper report reasoning. |
| Whisper or similar            | Transcript fallback and optional lyric/audio transcription.                                       |
| Text embedding model          | Transcript/comment/search semantic index.                                                         |
| Text LLM provider adapter     | Extraction, audio candidate reasoning, playlist explanation, report generation.                   |
| Lightweight supervised models | Transparent score/reaction/ranking baselines and early production predictor.                      |

## 25.4 Model report separation

The creator product must separate three output layers:

1. **Audio observation:** descriptive statements grounded in sound and timestamp, such as energy arc, arrangement change, vocal entry, mix density, or repeated section.
2. **Critic forecast:** what the Fantano-aligned model expects, with probabilities and confidence.
3. **Creator recommendation:** actionable advice aligned to the artist's stated goal, which may disagree with a critic forecast if artistic intention intentionally rejects broad appeal.

This separation prevents the tool from becoming an arbitrary score machine and makes it genuinely useful to artists.

---

# 26. Evaluation Framework and Success Metrics

## 26.1 Model accuracy metrics

| Capability                        | Primary metric                                  | Minimum proof standard before strong claims                                 |
| --------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------- |
| Album score prediction            | Mean absolute error and within +/-1 rate        | Beats metadata baseline on temporal holdout; publish actual value honestly. |
| Like/dislike or reaction category | Macro F1 and calibration                        | Beats majority-class baseline.                                              |
| Favorite track ranking            | Hit@1 and Hit@3                                 | Beats random and track-order baselines.                                     |
| Least favorite ranking            | Hit@1 and Hit@3                                 | Beats baselines.                                                            |
| Critique dimensions               | Macro F1 by dimension                           | Reliable enough on at least a subset of core dimensions.                    |
| Written forecast                  | Human judged topic alignment/evidence grounding | Human raters see meaningful alignment rather than fluent vagueness.         |
| Audio similarity                  | Human pairwise preference                       | Embedding retrieval beats metadata-only search.                             |

## 26.2 Artist usefulness metrics

| Goal                      | Metric                                                                  |
| ------------------------- | ----------------------------------------------------------------------- |
| Feedback is not generic   | Artist rating of specificity and timestamp accuracy.                    |
| Feedback leads to action  | Percentage of reports followed by revision upload or marked action.     |
| Revision loop works       | Percentage of artists who compare versions and identify useful changes. |
| Product provides exposure | Public publish rate and listener saves/plays/follows from discovery.    |
| Artists return            | Repeat project/submission rate.                                         |

## 26.3 Listener and viral metrics

| Goal                        | Metric                                                              |
| --------------------------- | ------------------------------------------------------------------- |
| Discovery is satisfying     | Playlist saves, track clicks, repeat generations, skips/dismissals. |
| Personalization matters     | Improvement in saves/clicks after taste events accumulate.          |
| Viral sharing works         | Share-card generation and referral traffic.                         |
| Archive retains fans        | Weekly archive users and new-review notification returns.           |
| Bench creates entertainment | Prediction reveals, challenges completed, shares, repeat visits.    |

---

# 27. Deployment and Infrastructure Plan

## 27.1 Service topology

| Service            | Deployment                        | Responsibilities                                                                               |
| ------------------ | --------------------------------- | ---------------------------------------------------------------------------------------------- |
| `web`              | Railway Next.js service           | Public UI, authenticated studio, API facade, share pages.                                      |
| `postgres`         | Railway PostgreSQL + pgvector     | Source of truth, job queue, structured data, vectors initially.                                |
| `corpus-worker`    | Railway Python worker/cron        | Source scanning, extraction, transcript/comment jobs, metadata entity resolution.              |
| `audio-worker`     | Railway CPU worker plus R2        | Candidate orchestration, downloads, FFmpeg normalization, storage, fingerprints, segmentation. |
| `ml-batch-worker`  | Modal GPU functions               | MuQ/MERT/Music Flamingo embeddings, batch feature jobs, candidate training.                    |
| `ml-inference-api` | Modal endpoint initially          | On-demand creator report features and prediction inference.                                    |
| `storage`          | Cloudflare R2                     | Normalized audio, private uploads, manifests, exported reports/model artifacts.                |
| `analytics`        | PostHog                           | User/product funnel metrics once public.                                                       |
| `monitoring`       | Sentry + internal admin dashboard | Exceptions, failed jobs, processing health.                                                    |

## 27.2 Approximate budget posture

This is a serious project rather than a zero-cost prototype. Keep constant costs low while using burst GPU spend deliberately. Railway web/database/workers and R2 storage should be modest at first. GPU embedding generation for an archive is a batch cost; expensive long-form audio-language analysis should be prioritized for creator uploads, benchmark gold sets, and visible product examples before running over every historical asset. As the corpus grows, calculate cost per ingested track, cost per creator report, and cost per active user before expanding expensive jobs.

## 27.3 Security and privacy essentials for creator uploads

Private artist files must use private object storage buckets or private object keys, presigned upload/download URLs, access checks on every studio report request, non-public storage paths, and deletion controls. Public release pages should use separate public-serving assets or signed playback logic after artists explicitly publish. This is not optional polish; a pre-release feedback product fails if musicians cannot trust private uploads.

---

# 28. Learning Curriculum Embedded into the Build

The project is an opportunity to become excellent at ML systems, audio intelligence, retrieval, and product engineering. Learn only what unlocks the next build milestone.

| Before phase | Learn                                                                                                           | Build proof before continuing                                                 |
| ------------ | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Phase 0      | PostgreSQL normalization, migrations, pgvector, job queues, idempotency.                                        | Local job runner and vector search toy prototype.                             |
| Phase 1      | Next.js server/data patterns, search/filter UX, metadata identity resolution.                                   | Archive grid powered only by normalized schema.                               |
| Phase 2      | Timestamped transcript processing, structured LLM extraction, evaluation annotation.                            | Gold set of transcript-linked critique labels.                                |
| Phase 3      | Audio formats, FFmpeg, acoustic fingerprinting, YouTube metadata matching, deterministic validation.            | Automated resolver audit and processed gold audio assets.                     |
| Phase 4      | Music representation learning, MuQ/MERT embeddings, HNSW indexes, hybrid retrieval, human retrieval evaluation. | Audio-seed playlist demo and comparison report.                               |
| Phase 5      | Private object storage, secure upload UX, asynchronous status updates, creator user interviews.                 | Real artist upload and report feedback.                                       |
| Phase 6      | Leakage, temporal splits, calibration, ranking metrics, reproducible ML datasets.                               | Benchmark report with baselines.                                              |
| Phase 7      | Multi-task prediction, retrieval-grounded generation, audio-language models, model serving.                     | Production candidate model beats baselines or provides measured artist value. |
| Phases 8-10  | Recommendation loops, experimentation/analytics, continual training/model promotion.                            | Retention and live-blind measurement dashboards.                              |

---

# 29. Detailed GitHub Issue / PR Backlog in Dependency Order

The backlog below is deliberately PR-sized. Do not open all issues at once as an unstructured wish list. Create milestones per phase and execute in order, while allowing small UI polish tasks in parallel with longer batch processing jobs.

## Milestone 0: Foundation and normalized corpus

| PR  | Issue title                                                                 | Outcome                                     |
| --- | --------------------------------------------------------------------------- | ------------------------------------------- |
| 001 | Add migration runner and local pgvector-enabled database configuration      | Reliable schema evolution and local setup.  |
| 002 | Snapshot current parser behavior with fixture videos/descriptions           | Protect current ingestion from regressions. |
| 003 | Create normalized critic, artist, release, track, and source-video schema   | Core entity foundation.                     |
| 004 | Create jobs table and Python worker claim/retry framework                   | Async pipeline foundation.                  |
| 005 | Seed Fantano critic record and import legacy `album_tracks` records         | Existing value enters new schema.           |
| 006 | Import legacy `singles` and deduplicate artists/tracks                      | Roundup data migrated.                      |
| 007 | Create corpus stats queries and internal stats page                         | Make data coverage visible.                 |
| 008 | Build hidden Archive V2 release/track grid from normalized tables           | Verify new read path.                       |
| 009 | Switch existing search query layer to normalized entities with parity tests | Retire old read dependency.                 |

## Milestone 1: Melondy-plus public archive

| PR  | Issue title                                                                | Outcome                                               |
| --- | -------------------------------------------------------------------------- | ----------------------------------------------------- |
| 010 | Implement full source-video catalog scan and video classification          | Discover all relevant Fantano material.               |
| 011 | Extract formal review release identity and score where available           | Populate review/release records.                      |
| 012 | Implement metadata enrichment and canonical identity merge job             | Covers, genres, years, labels, correct deduplication. |
| 013 | Build `/archive` cover grid with score/year/genre/type filters             | Public browsing product.                              |
| 014 | Build release detail pages with review source and existing track reactions | Core content page.                                    |
| 015 | Build artist pages with reviewed discography timeline                      | Fan exploration.                                      |
| 016 | Extend LLM structured search from tracks to releases/artists               | Conversational archive discovery.                     |
| 017 | Add missing-processing status indicators and correction logging            | Data gaps visible and inspectable.                    |

## Milestone 2: Text commentary and audience corpus

| PR  | Issue title                                                               | Outcome                                    |
| --- | ------------------------------------------------------------------------- | ------------------------------------------ |
| 018 | Implement caption/transcript fetch and timestamp storage                  | Transcript source layer.                   |
| 019 | Add fallback transcription job interface                                  | Process missing-caption sources later.     |
| 020 | Implement transcript merging and segment normalization                    | Usable analysis passages.                  |
| 021 | Add LLM extraction JSON schema for score, mention, reaction, and evidence | Structured critic data.                    |
| 022 | Implement track/release linking from transcript segments                  | Song-level commentary context.             |
| 023 | Implement fixed critique taxonomy and label extraction                    | Supervised targets.                        |
| 024 | Ingest top YouTube comments and store raw/comment metadata                | Audience context.                          |
| 025 | Generate comment sentiment/agreement/theme summary                        | Release audience panel.                    |
| 026 | Add transcript evidence and audience summary UI to release pages          | Archive now explains commentary.           |
| 027 | Create 100-review gold corpus report and extraction confidence dashboard  | Validate text pipeline before audio scale. |

## Milestone 3: Audio factory

| PR  | Issue title                                                               | Outcome                               |
| --- | ------------------------------------------------------------------------- | ------------------------------------- |
| 028 | Create R2 storage adapter and audio asset manifest schema                 | Durable audio storage.                |
| 029 | Adapt `yt-audio-api` behavior into internal YouTubeAudioAdapter           | Download/conversion worker.           |
| 030 | Implement audio candidate query generator                                 | Multiple candidate retrieval prompts. |
| 031 | Implement candidate metadata storage and LLM resolver schema              | Automated resolution.                 |
| 032 | Add deterministic duration/title/channel validation and abstention states | Prevent obvious wrong matches.        |
| 033 | Implement download, normalize, checksum, and fingerprint jobs             | Model-ready audio.                    |
| 034 | Add whole-track, 30-second, and 5-second segmentation jobs                | Multi-granularity representation.     |
| 035 | Add release/full-album asset support and track splitting                  | Album model foundation.               |
| 036 | Build audio processing admin status views and auto-retry controls         | Monitor automation.                   |
| 037 | Process and audit gold-set audio resolution success                       | Gate embeddings/training.             |

## Milestone 4: Embeddings and discovery

| PR  | Issue title                                                   | Outcome                          |
| --- | ------------------------------------------------------------- | -------------------------------- |
| 038 | Implement embedding model registry and pgvector migrations    | Versioned vector storage.        |
| 039 | Deploy MuQ batch embedding job on GPU service                 | Audio representations.           |
| 040 | Deploy MERT comparison embedding job for evaluation subset    | Benchmark representation choice. |
| 041 | Implement text embeddings for transcript evidence and queries | Semantic critical search.        |
| 042 | Build track/segment nearest-neighbor retrieval with filters   | Audio similarity backend.        |
| 043 | Build audio-seed upload/search UI                             | Listener sound discovery.        |
| 044 | Build natural-language hybrid discovery endpoint              | Prompt-based retrieval.          |
| 045 | Build dynamic playlist generator and sequencing logic         | Viral listener wedge.            |
| 046 | Add playlist save/share pages and basic taste events          | Retention loop.                  |
| 047 | Run human similarity and playlist-quality comparison report   | Validate discovery quality.      |

## Milestone 5: Artist studio

| PR  | Issue title                                                        | Outcome                       |
| --- | ------------------------------------------------------------------ | ----------------------------- |
| 048 | Add authentication and artist profile creation                     | Creator identity.             |
| 049 | Implement secure private upload flow and project/submission schema | Pre-release submission.       |
| 050 | Process creator audio through shared feature/embedding pipeline    | Studio analysis base.         |
| 051 | Build first structured general audio report with timestamp UI      | Useful initial feedback.      |
| 052 | Add critic-forecast and creator-score report layout                | Product differentiation.      |
| 053 | Retrieve comparable reviewed tracks for reports                    | Context and inspiration.      |
| 054 | Add new-version upload and comparison report                       | Revision workflow.            |
| 055 | Add full-album project upload/order interface                      | Album studio.                 |
| 056 | Add publish/schedule workflow and public release pages             | Artist exposure loop.         |
| 057 | Add emerging artist discovery row and playlist eligibility         | Connect artists to listeners. |
| 058 | Run artist beta feedback capture and report-quality iteration      | Validate usefulness.          |

## Milestone 6: Benchmark and prediction model

| PR  | Issue title                                                  | Outcome                      |
| --- | ------------------------------------------------------------ | ---------------------------- |
| 059 | Implement dataset manifest/version builder and leakage rules | Research foundation.         |
| 060 | Define temporal holdout and live-blind splits                | Credible evaluation.         |
| 061 | Train metadata-only score/reaction baselines                 | Baseline results.            |
| 062 | Train MuQ and MERT audio predictor comparison                | Audio signal test.           |
| 063 | Train favorite/least favorite track rankers                  | Album-specific forecast.     |
| 064 | Train critique-dimension predictors                          | Explainable reaction model.  |
| 065 | Implement blind prediction execution and lock/reveal storage | Product proof mechanism.     |
| 066 | Build Bench UI and public model-version dashboard            | Accuracy product.            |
| 067 | Build retrieval-grounded critic report generation            | Full forecast output.        |
| 068 | Publish Benchmark Report V1 and model card                   | Portfolio/research artifact. |

## Milestone 7: Album intelligence and release workflow

| PR  | Issue title                                                      | Outcome                    |
| --- | ---------------------------------------------------------------- | -------------------------- |
| 069 | Train ordered album representation model                         | Sequence-aware analysis.   |
| 070 | Implement album cohesion and pacing report                       | Album value.               |
| 071 | Implement strongest-single and cut/revise recommendation panel   | Creator release decisions. |
| 072 | Implement rearrange tracklist and rerun sequence analysis        | Interactive album editing. |
| 073 | Upgrade publishable pages with album critique/story presentation | Advance press artifact.    |
| 074 | Add shareable artist release and critique cards                  | Viral artist flow.         |

## Milestone 8: Retention and continual learning

| PR  | Issue title                                                       | Outcome                           |
| --- | ----------------------------------------------------------------- | --------------------------------- |
| 075 | Build personalized discover home from taste events                | Returning listener product.       |
| 076 | Add follow/notification system for reviews and artist releases    | Engagement loop.                  |
| 077 | Add fan-versus-model guess challenge UI                           | Shareable benchmark game.         |
| 078 | Implement high-frequency new-review detection pipeline            | Live updates.                     |
| 079 | Implement eligible live blind prediction before result extraction | Real-time accuracy proof.         |
| 080 | Implement dataset checkpoint and model promotion workflow         | Controlled continual improvement. |
| 081 | Add drift/quality monitoring dashboard                            | Keep model honest.                |

## Milestone 9: Expansion architecture

| PR  | Issue title                                                | Outcome                           |
| --- | ---------------------------------------------------------- | --------------------------------- |
| 082 | Generalize critic/lens selection throughout product UI/API | No hard-coded Fantano dependency. |
| 083 | Add second-lens ingestion proof of concept                 | Confirm extensibility.            |
| 084 | Add artist multi-lens report comparison UI                 | Long-term platform wedge.         |

---

# 30. What to Demo After Each Major Phase

| Phase              | Demo artifact                                                                             |
| ------------------ | ----------------------------------------------------------------------------------------- |
| Foundation         | Existing smart search preserved; normalized corpus stats and Archive V2.                  |
| Critical archive   | Beautiful album grid and release pages with scores/favorites/source links.                |
| Commentary corpus  | Timestamped "what he said and why" evidence and semantic critique search.                 |
| Audio factory      | Automated YouTube resolution, processing status, and segment assets for reviewed albums.  |
| Discovery          | Upload/select a song and generate a sonically coherent, critic-contextual playlist.       |
| Artist studio      | Private upload to report to version comparison to optional public release page.           |
| Benchmark          | Blind prediction on held-out reviewed album, reveal actual review, accuracy page.         |
| Critic model       | Score/reaction/critique forecast demonstrably beating baseline.                           |
| Album intelligence | Full artist album report with sequencing, singles, and revision decisions.                |
| Viral product      | Shared playlists, model challenges, and emerging artist discovery with retention metrics. |
| Continual system   | New Fantano review automatically produces a locked prediction and later reveal.           |

---

# 31. Immediate Starting Sequence: The Next Work to Execute

Do not begin by integrating Music Flamingo or downloading thousands of audio files. The first execution sequence should be:

1. Add this roadmap to the repository as `MASTER_ROADMAP.md` and create GitHub milestones matching the phases.
2. Build migration support and enable pgvector in local/staging Postgres.
3. Create the normalized corpus tables and the jobs table.
4. Import the existing favorite/best-track records and prove parity with the current app.
5. Build the public archive grid and release-page foundation.
6. Expand source scanning to classify every relevant Fantano video type and begin formal review/score extraction.
7. Implement timestamped transcript ingestion and structured critique-label extraction for a 100-review gold corpus.
8. Only after that gold corpus exists, implement the automated audio resolver and process those 100 releases first.
9. Generate initial MuQ/MERT embeddings, build audio similarity, and ship the first dynamic playlist demo.
10. Use the same audio processing foundation to ship private artist uploads and initial creator reports.
11. Build the versioned benchmark and train baseline predictors before presenting the generated Fantano-aligned review as accurate.
12. Once measurable prediction and real artist reports exist, combine the surfaces into the first complete public launch: discovery, artist submissions/publication, and Bench accuracy sharing.

This sequence creates visible product progress while preventing wasted ML work. You will have a compelling archive early, a standout discovery demo next, a useful artist product after that, and then a critic model whose quality can actually be proved.

---

# 32. Definition of "We Clearly Beat Them"

You will know the platform clearly beats the products in the competitive set when a user can do the following in one coherent application:

1. Browse a complete Fantano-linked music archive rather than only upload one song into a black box.
2. Ask deeply specific natural-language questions over both audio and actual criticism.
3. Upload a reference song and produce dynamic, sonically coherent playlists with critical explanations and emerging-artist discovery.
4. Upload an unreleased track privately and receive timestamped, critic-aligned, actionable feedback rather than generic adjectives or only mix metrics.
5. Upload an album and receive sequencing, strongest-single, favorite/least-favorite, predicted critical response, and revision planning.
6. Upload a revised version and see whether the changes improved the feedback and why.
7. Publish the track and critique as a discovery page that can bring the artist new listeners.
8. Challenge the model on albums with real published reviews and reveal measured accuracy.
9. Watch live predictions happen as new critic reviews arrive.
10. Eventually choose multiple critic or reception lenses rather than settle for generic "AI opinion."

The essential claim is not "we have more features." It is:

> **This is the first connected system where a real critical archive trains measurable audio intelligence, listeners discover music through both sound and criticism, and independent artists turn private advance feedback into public discovery opportunities.**

---

# 33. Source and Reference Appendix

The roadmap was informed by the following implementation and competitive references reviewed during planning:

1. Existing repository: `https://github.com/calebnewtonusc/fantano` : current Python/Railway/Postgres/Next.js favorite-track ingestion and smart-search architecture.
2. Audio download reference service: `https://github.com/alperensumeroglu/yt-audio-api` : Flask, `yt-dlp`, FFmpeg, tokenized temporary audio delivery pattern to adapt into an internal audio adapter.
3. Vector storage foundation: `https://github.com/pgvector/pgvector` : Postgres vector similarity search with indexing support.
4. Music understanding candidate: `https://github.com/NVIDIA/audio-flamingo` : open audio-language model family for advanced audio understanding.
5. Music embedding candidate: `https://github.com/tencent-ailab/MuQ` : music representation learning model candidate.
6. Embedding baseline candidate: `https://github.com/yizhilll/MERT` : acoustic music understanding baseline candidate.
7. Grumpy Music: `https://grumpymusic.com/` : upload feedback with A&R, producer, and audio engineer personas and human expert follow-up.
8. CriticAI: `https://criticai.ca/` : instant music/writing upload feedback competitor.
9. Cyanite: `https://cyanite.ai/` : catalog tagging, natural-language search, audio similarity/search workflows.
10. Mix Check Studio: `https://mixcheckstudio.roexaudio.com/` : technical mix/master feedback competitor.
11. SONOTELLER: `https://sonoteller.ai/` : music/lyric attribute analysis competitor.
12. Melondy: `https://melondy.com/` : Fantano scored-album browse reference to exceed.
13. User-supplied search screenshot identifying additional immediate-feedback/analyzer competitors including TrackMuse, Coda, Sonar, Musicful, OpenMusic AI, Soun, and MusicCreator-style analyzer products; validate specific current product surfaces during UI benchmarking before public launch.

---

# Final Execution Rule

Build the full dream system, but never build it as disconnected ambition. Every phase must compound the same moat:

> **audio + real critical response + measurable prediction + listener discovery + artist improvement + public exposure.**

When deciding between two tasks, choose the one that either improves this corpus, creates a visible user loop on top of it, or proves the model's value with real measurements. That is how this grows from a YouTube-description search tool into the defining AI-native music criticism and discovery platform for artists and listeners.
