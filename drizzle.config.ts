import { defineConfig } from "drizzle-kit";

const provider = (process.env.DB_PROVIDER ?? "sqlite") as "sqlite" | "supabase";

export default defineConfig(
  provider === "supabase"
    ? {
        schema: "./lib/db/schema.pg.ts",
        out: "./drizzle",
        dialect: "postgresql",
        dbCredentials: {
          url: process.env.DATABASE_URL!,
        },
      }
    : {
        schema: "./lib/db/schema.ts",
        out: "./drizzle",
        dialect: "sqlite",
        dbCredentials: {
          url: "sahha.db",
        },
      }
);
