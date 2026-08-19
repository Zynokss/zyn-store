import { defineConfig, env } from "@prisma/config";
import { config } from "dotenv";

// Explicitly load the environment variables into the Node process.
// This project keeps its variables in .env.local (there is no plain .env),
// so the Prisma CLI (generate/migrate/studio) must load that file to see DATABASE_URL.
config({ path: '.env.local' });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL")
  }
});