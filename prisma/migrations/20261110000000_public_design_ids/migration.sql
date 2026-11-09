-- Preserve gifts and their existing links. Public garden designs get unrelated IDs.
ALTER TABLE "bouquets" ADD COLUMN "garden_id" VARCHAR(128);

UPDATE "bouquets"
SET "garden_id" = replace(gen_random_uuid()::text, '-', '')
WHERE "visibility" = 'public';

CREATE UNIQUE INDEX "bouquets_garden_id_key" ON "bouquets"("garden_id");
CREATE INDEX "bouquets_visibility_created_at_garden_id_idx"
ON "bouquets"("visibility", "created_at" DESC, "garden_id" DESC);
