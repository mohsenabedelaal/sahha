"use client";

import Dexie, { type EntityTable } from "dexie";

interface OfflineMealLog {
  id?: number;
  food_item_id?: number;
  food_name: string;
  meal_type: string;
  servings: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  logged_at: string;
  synced: boolean;
}

const offlineDb = new Dexie("sahha-offline") as Dexie & {
  mealLogs: EntityTable<OfflineMealLog, "id">;
};

offlineDb.version(2).stores({
  mealLogs: "++id, meal_type, logged_at, synced",
});

export type { OfflineMealLog };
export { offlineDb };
