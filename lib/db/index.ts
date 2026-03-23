// Database provider abstraction.
// Set DB_PROVIDER=supabase in .env.local to use Supabase (PostgreSQL).
// Defaults to 'sqlite' for local development.
//
// SQLite:   no extra config needed, uses sahha.db
// Supabase: set DB_PROVIDER=supabase and DATABASE_URL=postgresql://...

import type * as SchemaTypes from "./schema";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

const provider = process.env.DB_PROVIDER ?? "sqlite";

// Load the schema for the active provider at runtime.
// TypeScript sees this as the SQLite schema type for IDE/type-check support.
// At runtime it resolves to either schema.ts (SQLite) or schema.pg.ts (Postgres).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const activeSchema = (
  provider === "supabase" ? require("./schema.pg") : require("./schema")
) as typeof SchemaTypes;

function createDb(): BetterSQLite3Database<typeof SchemaTypes> {
  if (provider === "supabase") {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL must be set when DB_PROVIDER=supabase");
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { drizzle } = require("drizzle-orm/node-postgres") as typeof import("drizzle-orm/node-postgres");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool } = require("pg") as typeof import("pg");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    return drizzle(pool, { schema: activeSchema }) as unknown as BetterSQLite3Database<typeof SchemaTypes>;
  }

  // Default: SQLite
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { drizzle } = require("drizzle-orm/better-sqlite3") as typeof import("drizzle-orm/better-sqlite3");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require("better-sqlite3") as typeof import("better-sqlite3");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sqlite = new (Database as any)("sahha.db");
  sqlite.pragma("journal_mode = WAL");
  return drizzle(sqlite, { schema: activeSchema });
}

export const db = createDb();

// Re-export all schema tables from the active provider.
// TypeScript types are inferred from the SQLite schema (canonical for IDE support).
// At runtime, tables resolve to the correct provider's table definitions.
export const {
  users,
  foodItems,
  mealLogs,
  mealPlans,
  mealPlanItems,
  achievements,
  userAchievements,
  dailyChallenges,
  userChallengeProgress,
  educationContent,
  notificationSubscriptions,
  quizQuestions,
  userEducationProgress,
  userQuizResults,
  chatMessages,
  waterLogs,
} = activeSchema;
