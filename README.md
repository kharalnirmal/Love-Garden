# Love Garden

Personalized digital bouquets, made to send a little love.

Choose flowers, arrange a bouquet, write a note, and share a private link or QR code. Recipients open a floral envelope to reveal their flowers and message.

## Features

- Twelve illustrated flowers in color or black and white, with quantities and arrangement controls.
- Greenery, ribbons, wrapping, gift tags, and three note-card styles.
- Handwritten notes and a recipient reveal with reduced-motion support.
- Copyable gift links and downloadable PNG/SVG QR codes.
- Unlisted gifts by default; an optional public, paginated garden.
- Server-side validation, random gift IDs, and database-backed write limits.

## Run locally

Requires Node.js 22.12+ and pnpm 10.32.0.

```bash
git clone https://github.com/kharalnirmal/digiboquet.git
cd digiboquet
pnpm install --frozen-lockfile
```

Copy `.env.example` to `.env.local`, then provide a Neon **development branch's** pooled and direct database URLs. Generate a random `RATE_LIMIT_SECRET` using the command in the example. Keep all real environment files private.

```bash
pnpm db:migrate:deploy
pnpm dev
```

Open <http://localhost:3000>. Never run development fixture tests against production.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Next.js development server |
| `pnpm build` | Generate Prisma client and build the application |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript checks |
| `pnpm test` | Validation, sharing, and QR decoding tests |
| `pnpm db:validate` | Validate the Prisma schema |
| `pnpm db:migrate:deploy` | Apply checked-in migrations |

## Architecture

Next.js App Router, React, TypeScript, Tailwind CSS, shadcn-style UI primitives, Prisma, and Neon Postgres.

```text
app/                   Pages, API handlers, QR exports, and share previews
components/bouquet/    Bouquet artwork, creation flow, reveal, and sharing UI
components/stages/     Pick, arrange, write, and send steps
components/ui/         Shared accessible controls
context/               Client-side bouquet draft state
data/                  Flower catalog and meanings
lib/                   Server-only persistence, validation, limits, and QR helpers
prisma/                Schema and versioned SQL migrations
public/                Original flower illustrations and static assets
styles/                Shared visual styles
tests/                 Unit and development-only integration tests
```

The client owns an unsaved draft. `POST /api/bouquets` validates and stores it on the server. A successful save opens `/bouquet/[id]/share`; copied links and QR codes open `/gift/[id]`. Original `/bouquet/[id]` links remain supported.

Database access is server-only. The garden shows designs using separate random public IDs; it never links to recipient gifts or displays names, notes, or personal gift tags. Social previews also exclude personal text. A recipient gift is **not authenticated**: anyone holding its separate URL can read it. The share page is read-only, not an authenticated ownership screen.

## Deployment

See [deployment and database configuration](docs/DEPLOYMENT.md) for environment variables, migrations, operational limits, and verification.

## Credits and permissions

Love Garden is maintained by [Nirmal Kharal](https://www.instagram.com/nirmalkharal/) and builds on [DigiBouquet](https://github.com/sauravsid/digibouquet). Original project and flower artwork credit: [@pau_wee_](https://x.com/pau_wee_).

No license or explicit artwork-reuse grant was supplied with the original source. This repository does not grant rights to the inherited code or illustrations; confirm permission before redistributing or commercializing them.
