# Deployment

## Production configuration

Use a permanent Neon production branch, not an expiring preview branch. Configure these variables in the hosting platform; local `.env.local` is never uploaded by Git:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Production pooled Postgres connection, with TLS |
| `DATABASE_URL_UNPOOLED` | Same database and branch, direct connection for migrations |
| `APP_ORIGIN` | Public HTTPS origin, such as `https://flowers.example.com` |
| `RATE_LIMIT_SECRET` | Random secret of at least 32 characters |
| `NEON_BRANCH` | `production` (operational label, not a connection switch) |

Changing `NEON_BRANCH` alone does not change databases. The connection URLs determine the target. Never expose database credentials through `NEXT_PUBLIC_` variables.

The application uses a shared, bounded Prisma connection pool in production. Development uses isolated clients to avoid cross-request React debug traces. No schema change is needed for ribbon, wrapping, tag, or card-style customization.

## Release

1. Install with `pnpm install --frozen-lockfile`.
2. Run `pnpm lint`, `pnpm typecheck`, and `pnpm test`.
3. Test new migrations on a development branch of production first.
4. Inspect `pnpm exec prisma migrate status`, then use `pnpm db:migrate:deploy` for reviewed pending migrations. Never use `db push`, reset, or development migrations on production.
5. Run `pnpm build`, then deploy using the hosting platform. Configure production variables separately in that platform.
6. Verify saving, sender sharing, recipient reveal, garden privacy, QR downloads, and phone-camera scanning using the public HTTPS URL.

`APP_ORIGIN=http://localhost:3000` is for local use only. QR codes using localhost will not open the app from another device. Do not treat a successful build as browser or mobile verification.

The save API accepts `APP_ORIGIN` and, on Vercel, platform-provided `VERCEL_URL` and `VERCEL_PROJECT_PRODUCTION_URL` origins. Development also accepts the address serving that request, including local-network addresses. Custom production domains must match `APP_ORIGIN`; arbitrary request Host headers never extend the production allowlist.

## Database operations

- Retain Neon restore history appropriate for the project and monitor storage, compute, connection errors, and save failures.
- Do not reset branches, remove gifts, or copy development fixtures into production during deployment.
- Write attempts are limited atomically to five per hourly client bucket. On Vercel, the limiter uses the platform-overwritten client-IP header. Other hosts intentionally share one bucket until a trusted proxy identity is implemented; configure this before serving multiple users outside Vercel.
- Periodically remove expired rows from `write_rate_limits` using a trusted scheduled database job. The table stores HMAC bucket keys, not raw addresses. Cleanup is not scheduled by this repository.
- The sender page provides no edit or delete operations and is not authenticated ownership. Keep gift URLs private when using unlisted visibility.
- Public-garden consent starts unchecked each time the final step opens. Saving without opting in creates an unlisted gift. Garden listings and design pages use independent random IDs and never expose the recipient gift ID, names, note, or personal tag. Names and notes are still stored for the separate recipient gift link; anyone holding that gift link can read them.
- Existing gifts in another database are not imported automatically. Switching from a development branch to production does not move that branch's gifts.

## Development-only integration tests

Use an isolated branch named `dev-verification`, a local `APP_ORIGIN`, and a test-only limiter secret. The integration scripts insert and remove their own fixtures:

```bash
pnpm exec tsx --conditions=react-server tests/neon.integration.ts
pnpm exec tsx --conditions=react-server tests/gallery-isolation.integration.ts
pnpm exec tsx --conditions=react-server tests/public-design.integration.ts
```

`scripts/test-neon.mjs` also checks an already-running local server over HTTP. None of these fixture-writing scripts should be used against production.

## Remaining release checks

- Confirm original source and illustration reuse permissions.
- Check the current dependency audit: `pnpm audit --prod`.
- Complete browser accessibility, mobile, reduced-motion, and public-origin QR checks before announcing a release. This project stays on Next.js 15; the installed Next.js 16.3+ runtime-verification workflow is incompatible. Upgrade only as a separately tested change.
