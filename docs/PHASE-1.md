# Love Garden: Phase 1

## Neon deployment follow-up (2026-11-09)

This update supersedes the initial configuration and verification status below:

- The workspace is authenticated and linked to the requested production branch.
  `neon deploy` succeeded and pulled server-only database variables locally.
- Prisma now loads `.env.local` and `.env`, and prefers
  `DATABASE_URL_UNPOOLED` for migrations. The application retains its existing
  Prisma Neon adapter and uses pooled `DATABASE_URL`.
- The checked-in migration passed on a temporary branch of production, then on
  the empty production database. The temporary branch was deleted afterward.
- `APP_ORIGIN` and a random `RATE_LIMIT_SECRET` were configured locally.
- `npm run build` passed; all 8 unit tests passed.
- `node scripts/test-neon.mjs` passed against `next start`: API saves, Neon row
  persistence, share-page reads, public/unlisted garden privacy, and the sixth
  write returning HTTP 429. All five test bouquets were removed afterward.
- The Next.js 16.3-only development-loop skill was not used on this Next 15 app.
  Browser/mobile interaction tests and legacy Supabase data import remain undone.
- Dependency installation was repaired with npm after interrupted npm/pnpm
  installs. Both lockfiles remain in the repository; pnpm's lock was refreshed.
- The dependency audit is not clean: npm reported 12 findings overall, including
  one critical finding in legacy Supabase CLI's transitive `tar` dependency.
  No broad or breaking audit fix was applied.
- The public repository excludes all `.env*` files (including examples), local
  `.neon` linkage, credentials and `node_modules`. Use README's env setup instead
  of the historical `.env.example` references below.

## Scope and checkpoint

This is an incremental upgrade of the existing DigiBouquet fork, not a replacement.
Checkpoint: `love-garden-pre-phase-1-20261109` (original commit `2091aad`).
Original routes, flower catalog/assets, mode names, nested flowers/letter/order data,
greenery controls, arrangement shuffle, and @pau_wee_ credits remain.

Baseline: Next 15.4.5, React 19.1.1, TypeScript strict, Tailwind v4 manifest,
Supabase JS 2.53.0. Original type-check and production build passed; lint was an
interactive setup prompt. Next was updated within v15 for critical security fixes.
The npm lock was stale (Tailwind v3), and both npm/pnpm locks were committed.
Use **pnpm** consistently, as selected by the user after concurrent package-manager
activity was detected. This phase initially used npm, so the npm lock changes also
remain for review; the pnpm lock is authoritative for the next install.

## Neon configuration (required before persistence works)

1. Choose your Neon project and an isolated **development branch**. No database
   project has been provisioned and no remote migration has been executed here.
2. Add the keys from `.env.example` to existing `.env.local`, preserving other keys:
   - `DATABASE_URL`: pooled PostgreSQL connection for that branch (`-pooler` host).
   - `DATABASE_URL_UNPOOLED` (or `DIRECT_URL`): direct connection to the **same** branch for migrations.
   - `APP_ORIGIN`: absolute site origin (localhost during development; HTTPS on Vercel).
   - `RATE_LIMIT_SECRET`: random secret, at least 32 characters.
3. Run `pnpm db:generate`, `pnpm db:validate`, then
   `pnpm db:migrate:deploy` **against the development branch**. Review the SQL
   under `prisma/migrations/` before applying. It creates new tables and does not
   drop old data. Never apply this initial migration over an existing incompatible
   `bouquets` table; stage/import separately instead.
4. Start `pnpm dev`. Save a six-flower test bouquet, open its returned URL in a
   separate browser, then restart the server and open it again to verify persistence.
5. Verify unlisted gifts never appear in `/garden`; explicitly public ones do.
   Test more than 12 public gifts for pagination, including equal creation dates.
6. Set equivalent server-side Vercel variables. Rehearse migrations on a Neon
   branch of production before any approved production rollout. Build generates
   Prisma client but deliberately does **not** migrate the database.

No DATABASE_URL is public or imported into browser components. Missing credentials
produce a recoverable save error, not a fake saved gift or an in-memory database.
Unlisted is a capability-link privacy model, **not** authenticated/private storage:
anyone holding the URL can read its message. Keep links confidential.

## Operations and security

- `POST /api/bouquets`: same-origin JSON, actual streamed body <=16 KiB, Zod
  validation, server-generated 24-character cryptographic share ID, safe errors.
- Repository functions validate create input and share IDs. No raw SQL interpolation
  is used except Prisma's parameterized tagged SQL for the limiter.
- Public list: 12 items per page plus one look-ahead, stable creation-date/ID order,
  database-side `visibility=public`, explicit select excludes letters/names.
- Public write limit: 5 valid attempts/hour/client across instances via atomic
  PostgreSQL UPSERT. Uses only Vercel's trusted client header when deployed there;
  other hosts/local development share a bucket until a trusted proxy is configured.
  No raw IP is stored. Fixed windows permit boundary bursts; add Vercel firewall/
  bot protection at higher traffic. Validation failures do not consume DB writes.
- Schedule daily maintenance on the database to remove expired limiter rows:
  `DELETE FROM write_rate_limits WHERE "expiresAt" < now() - interval '1 day';`
  No scheduler or automatic deletion has been provisioned. This cleanup touches
  only limiter records, never bouquets.
- Names <=80 characters; message <=2000; React text nodes render input as text.
- Old share route is preserved and set noindex. Gift reveal, per-gift OG and QR
  are subsequent phases, not claimed as delivered by this backend checkpoint.
- Saving disables repeated clicks. After an ambiguous network failure, a retry can
  create a second gift; request-idempotency can be added before a high-volume launch.

## Safe legacy export/import

1. Keep Supabase project, backups, and original deployment intact. Restrict access
   to exports: they contain personal messages. Do not commit exports or keys.
2. With an authorized **server-side** Supabase/PostgreSQL credential, export only
   `public.bouquets` to a local encrypted backup or restricted JSON/CSV staging file.
   Include original `id`, `short_id`, `mode`, `flowers`, `letter`, `timestamp`,
   `greenery`, `flowerOrder`, and `created_at`. The old frontend routes by `id`,
   not `short_id`. Keep a full database backup independently of this export.
3. Import into an isolated Neon development database after applying the new schema.
   Convert `id` to string and retain it as the new primary/share ID, preserving old
   `/bouquet/[id]` links. Retain `short_id` in the backup (not previously used in URLs).
   Preserve millisecond timestamp and parse creation date explicitly as UTC.
4. Validate each row against the new Zod schema **before** import. Old clients could
   exceed ten flowers or save bad arrangements: quarantine/report invalid rows;
   do not silently discard or auto-rewrite them. Review any repair separately.
   For missing legacy order, propose the default permutation for explicit approval.
5. Set all imported gifts **unlisted**, regardless of their former garden exposure.
   Never infer consent to republish romantic messages. Import with transactional,
   parameterized inserts; conflicts must abort/report, never overwrite existing gifts.
6. Compare counts, preserved IDs, nested JSON, timestamps, and sampled color/mono
   rendering. Verify public/unlisted separation and pagination. Run old URL checks.
7. Plan a brief write freeze or incremental final export to avoid missing gifts
   written during cutover. Switch deployment only after verification; keep old
   service read-only for a rollback period. Do not delete Supabase data.
8. **After Neon works**, remove `lib/supabase.ts`, both Supabase dependencies and
   legacy NEXT_PUBLIC_SUPABASE variables; update the chosen lockfile. They remain
   temporarily because Neon connectivity/cutover has not been verified. No active
   application screen uses Supabase now.

## Tools and optional project-local skills

No project-local skills or MCP resources were present at audit. Neon skills later
became available at the harness/user level; they are not project-local installations.
Neon CLI is installed but has no authenticated profile. No browser authentication
was launched, and no second database/project was created.

Optional Skills.sh installs from repository root (no `--global`):

```sh
npx skills add vercel-labs/agent-skills --skill react-best-practices --agent opencode
npx skills add vercel-labs/agent-skills --skill web-design-guidelines --agent opencode
npx skills add anthropics/skills --skill frontend-design --agent opencode
npx skills add neondatabase/agent-skills --skill neon-postgres --agent opencode
```

These are optional agent instructions, not runtime packages. Playwright/Context7
MCP is not configured. The supplied `next-dev-loop` skill requires Next >=16.3;
its runtime workflow cannot run on this Next 15 project. Do not claim it passed.

## Licensing / publication gate

No LICENSE or separate asset permission notice was found. Public source availability
does not imply permission to redistribute illustrations or code. Confirm the original
author's code and asset permissions before publishing. Existing credits remain; no
license or ownership claim has been invented for the original work.

## Next phases

1. Finish real Neon persistence/privacy verification and dependency cleanup.
2. Refine Love Garden branding/selection/mobile UI without replacing the flow.
3. Add progressive wrapping/ribbon/card/tag controls and rendering.
4. Dedicated `/gift/[id]` reveal, old-link compatibility, safe dynamic OG metadata.
5. Functional pink QR with PNG/SVG downloads and automated decoding.
6. Browser E2E, accessibility, performance, security and Vercel release checks.

## Verification status at handoff

- Eight validation/arrangement unit tests pass; strict TypeScript passes.
- Prisma client generation and schema validation pass, including after pnpm install.
- Standalone lint passed before dependency reconciliation (one config warning,
  subsequently fixed). Latest lint failed in ESLint/Next dependency resolution;
  this is **not** a final passing lint result.
- Original baseline production build passed. Updated build is **not verified**:
  concurrent npm/pnpm changes removed Next/Prisma files during verification.
  Final attempt failed with `prisma is not recognized` after a successful pnpm install.
  Pause other installers before repairing the workspace and rerunning checks.
- Neon variables arrived in `.env.local` during work; no connection test, schema
  migration, create/retrieve test, or production write has been executed.
- APP_ORIGIN and RATE_LIMIT_SECRET still need configuration if absent. Keep secrets
  out of version control. Do not deploy until real persistence/privacy checks pass.
- Browser/mobile E2E, QR, and dynamic per-gift OG tests have not run in Phase 1.
- Dependency audit found remaining issues (including legacy Supabase CLI's tar
  dependency). Next 15.5.29 removes original critical Next issues, but does not make
  the whole dependency tree clean. Re-audit the authoritative pnpm installation.
