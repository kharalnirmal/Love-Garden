-- New Neon database only. Rehearse on a development branch before deployment.
CREATE SCHEMA IF NOT EXISTS "public";
CREATE TYPE "Visibility" AS ENUM ('unlisted', 'public');

CREATE TABLE "bouquets" (
    "id" VARCHAR(128) NOT NULL,
    "mode" VARCHAR(5) NOT NULL,
    "flowers" JSONB NOT NULL,
    "letter" JSONB NOT NULL,
    "flowerOrder" JSONB NOT NULL,
    "greenery" INTEGER NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "visibility" "Visibility" NOT NULL DEFAULT 'unlisted',
    "presentation" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bouquets_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "bouquets_mode_check" CHECK ("mode" IN ('color', 'mono')),
    CONSTRAINT "bouquets_greenery_check" CHECK ("greenery" BETWEEN 0 AND 2)
);

CREATE TABLE "write_rate_limits" (
    "key" VARCHAR(64) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "write_rate_limits_pkey" PRIMARY KEY ("key")
);

CREATE INDEX "bouquets_visibility_created_at_id_idx"
    ON "bouquets"("visibility", "created_at" DESC, "id" DESC);
CREATE INDEX "write_rate_limits_expiresAt_idx" ON "write_rate_limits"("expiresAt");
