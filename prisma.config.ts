import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  // Generation/validation works offline. Migration commands still require credentials.
  datasource: { url: process.env.DATABASE_URL_UNPOOLED || process.env.DIRECT_URL || process.env.DATABASE_URL || "" },
});
