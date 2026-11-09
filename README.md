# 🌸 DigiBouquet

> Love Garden upgrade in progress in this original fork. See
> [Phase 1 setup, migration, privacy, and verification notes](docs/PHASE-1.md).
> Application database: Neon PostgreSQL + Prisma 7. Production-server persistence
> and public/unlisted separation have been verified; legacy data is not imported.

> Beautiful flowers delivered digitally

DigiBouquet allows users to create personalized digital flower bouquets with meaningful messages. Choose from a curated selection of flowers, each with their own symbolic meanings and birth month associations, to create beautiful bouquets that can be shared digitally.

## ✨ Features

- **🌺 Flower Selection**: Choose from 12 different flowers, each with unique meanings:

  - 🌹 Rose (Love and passion) - June
  - 🌷 Tulip (Perfect love) - April
  - 🌸 Peony (Romance) - May
  - 🌻 Sunflower (Adoration) - August
  - 🌺 Orchid (Beauty) - October
  - 💐 Dahlia (Elegance) - August
  - 🌼 Daisy (Innocence) - April
  - 🌾 Lily (Purity) - May
  - 🌟 Anemone (Anticipation) - September
  - 🌿 Carnation (Fascination) - January
  - ⭐ Zinnia (Lasting Affection) - July
  - 🎪 Ranunculus (Radiant Charm) - March

- **📝 Personal Messages**: Add custom cards with sender, recipient, and personalized messages

- **🏡 Garden View**: Browse previously created bouquets
- **🔗 Shareable Links**: Each bouquet gets a unique URL for easy sharing

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Neon Postgres with Prisma (server-side only)
- **UI Components**: Shadcn UI

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd digibouquet
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

    Link and deploy the Neon Postgres configuration from the project root:

    ```bash
    neon init -y --org-id org-aged-unit-20404474 --project-id red-term-11717269 --branch production --services postgres
    neon deploy
    ```

    Neon pulls `DATABASE_URL` (pooled, for application queries) and
    `DATABASE_URL_UNPOOLED` (direct, for Prisma migrations) into `.env.local`,
    or `.env` if it exists. Keep these credentials server-only and uncommitted.
    Prisma loads `.env.local` first, then `.env`, and also supports the legacy
    `DIRECT_URL` migration variable.

    Add `APP_ORIGIN` (your website origin; locally `http://localhost:3000`)
    and a random `RATE_LIMIT_SECRET` of at least 32 characters.
    All `.env*` files are intentionally excluded from this public repository.
    Generate the secret with
    `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
    Apply checked-in migrations with `npm run db:migrate:deploy` before starting
    the app. Test schema changes on an isolated Neon branch before production.
    Existing bouquets from another database are not imported automatically.

4. **Run the development server**

   ```bash
   pnpm dev
   ```

### Production integration check

After building, start a local production server:

```bash
npm run build
APP_ORIGIN=http://127.0.0.1:3100 npm start -- --hostname 127.0.0.1 --port 3100
```

In a second terminal, run `node scripts/test-neon.mjs`. It creates temporary
bouquets through the app API, verifies the actual Neon rows and share pages,
checks garden privacy and the database-backed rate limit, then deletes its test
records. Use a development Neon branch for routine tests. This is an HTTP
integration check, not a browser/mobile UI test.

## 📁 Project Structure

```
digibouquet/
├── app/                      # Next.js App Router pages
│   ├── bouquet/             # Bouquet creation and viewing
│   ├── garden/              # Garden view page
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── bouquet/            # Bouquet display components
│   ├── stages/             # Creation flow stages
│   └── ui/                 # Reusable UI components
├── context/                # React Context providers
├── data/                   # Static data (flowers, meanings)
├── lib/                    # Utility functions
├── types/                  # TypeScript type definitions
├── public/                 # Static assets
│   ├── color/              # Color flower images
│   ├── mono/               # Black & white images
│   └── full/               # Full resolution images
└── styles/                 # Global styles
```

---

_Create meaningful digital bouquets that bloom forever_ 🌺
