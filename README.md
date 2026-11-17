# Unwritten Rules: Khmer Beliefs, Taboos and Etiquette

> An interactive digital repository deciphering the taboos, ethical protocols, and domestic beliefs passed down across generations in Cambodia.

Preserving oral traditions, ancient household taboos, and etiquette taught by Cambodian elders — exploring why these rules exist and whether younger generations still practice them today.

**Curated by** LORN_Hongnida · **ICT 340 Vibe Coding Project** (Fall 2026)  
American University of Phnom Penh

---

## About the Archive

This is a **Khmer Living Archive** — a community-powered digital collection that captures Cambodia's unwritten cultural rules before they fade from living memory. Every entry documents a belief, taboo, or point of etiquette shared by elders, along with its practical origin and whether it is still observed today.

The archive is organized into three cultural realms:

| Category | Focus |
|---|---|
| **Etiquette & Manners** — សុជីវធម៌ និងការគោរព | Respectful posture, eldership reverence, and social conduct passed down across Cambodian families. |
| **Beliefs & Rules** — ជំនឿ និងក្បួនច្បាប់ | Household omens, spiritual customs, and elder wisdom rooted in gratitude, nature, and ancestral protection. |
| **Taboos & Warnings** — ការហាមប្រាម និងអាសន្ន | Protective prohibitions and survival warnings designed by village elders to shield youth from danger. |

Each entry is bilingual (English and Khmer), preserving both the meaning and the original voice of the tradition.
---

## Features

- **Browse & Search** — Explore the full archive, search across all fields, filter by category.
- **Theme Switching** — Toggle between the three cultural themes (Etiquette, Beliefs, Taboos), each with its own visual atmosphere, colour palette, and Khmer decorative motifs.
- **Dark / Light Mode** — Switch between dark and light reading modes.
- **Contributor Accounts** — Sign up and sign in to share your own entries.
- **Submit Your Own Entries** — Contribute traditions told by your family, with photo upload and a live preview before publishing.
- **My Entries** — Track the status of everything you have submitted (pending review, published, or returned with notes).
- **Submit → Review → Publish Workflow** — Entries are reviewed before they appear in the public archive, ensuring authenticity and quality.
---

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
- **Language:** JavaScript (no TypeScript)
- **Database & Auth:** [Supabase](https://supabase.com/) (via `@supabase/supabase-js` and `@supabase/ssr`)
- **Styling:** Plain CSS with inline style objects — no CSS frameworks or component libraries
- **Typography:** Plus Jakarta Sans, Kantumruy Pro, Noto Serif Khmer
- **Deployment:** [Vercel](https://vercel.com/)

All configuration specific to this archive lives in `collection.config.js` (name, description, curator, source). The app reads from it; values are never hard-coded.

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (for the database and authentication)

### Environment Variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Required variables (never committed to the repository):

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

---

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── browse/            # Browse & search the full archive
│   ├── contribute/        # Submit a new entry (authenticated)
│   ├── login/             # Contributor sign-in
│   ├── signup/            # Contributor registration
│   ├── my-entries/        # Your submitted entries & their status
│   ├── globals.css        # Global styles (5374 lines of themed CSS)
│   ├── layout.js          # Root layout with Google Fonts & ThemeProvider
│   ├── page.js            # Home page with hero, sample grid, and footer
│   └── icon.svg           # Site favicon
├── components/            # React components (18 files)
│   ├── BilingualMessage.js
│   ├── DeleteConfirmModal.js
│   ├── EntryCard.js
│   ├── EntryDetailModal.js
│   ├── EntryOwnerActions.js
│   ├── EntryPreviewCard.js
│   ├── EntryStatusBadge.js
│   ├── HeroSection.js
│   ├── ImageCropper.js
│   ├── KbachMotifs.js     # Decorative Khmer motifs (lotus, crown, lantern, moon)
│   ├── SearchAndFilter.js
│   ├── SiteNav.js
│   ├── ThemeAtmosphereBackdrop.js
│   ├── ThemeDropdown.js
│   ├── ThemeProvider.js
│   ├── UserNavAuth.js
│   ├── useEntries.js
│   └── useEntryRoute.js
├── data/
│   └── themes.js          # Theme metadata (labels, motifs, hero copy, vibe descriptions)
├── lib/
│   └── supabase/
│       ├── client.js      # Supabase browser client
│       └── server.js      # Supabase server client
├── collection.config.js   # Single source of truth for the archive's identity
├── AGENTS.md              # AI coding agent instructions
├── next.config.mjs
├── package.json
└── README.md
```

---

## Academic Context

This project was built for **ICT 340 — Vibe Coding** at the **American University of Phnom Penh**. The assignment asks each student to build a four-feature skeleton (browse and search, contributor accounts, own-your-entries, submit-review-publish) around their own collection of Khmer culture, delivered across three sprints.

The content shared in this archive comes from the curator's **parents, relatives, grandparents, friends, and community** — the oral storytellers who preserved these customs across generations.

---

## License & Attribution

© 2026 Unwritten Rules: Khmer Beliefs, Taboos and Etiquette.  
Curated by LORN_Hongnida.

Dedicated with gratitude to the grandmothers, grandfathers, and oral storytellers who preserved these customs.
