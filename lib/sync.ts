"use client";

import { offlineDb } from "./offline-db";

export async function syncOfflineMeals(): Promise<number> {
  if (typeof window === "undefined" || !navigator.onLine) return 0;

  const unsynced = await offlineDb.mealLogs
    .where("synced")
    .equals(0)
    .toArray();

  if (unsynced.length === 0) return 0;

  const meals = unsynced.map((m) => ({
    food_name: m.food_name || "Unknown Food",
    meal_type: m.meal_type,
    servings: m.servings,
    calories: m.calories,
    protein_g: m.protein_g,
    carbs_g: m.carbs_g,
    fat_g: m.fat_g,
    logged_at: m.logged_at,
  }));

  const res = await fetch("/api/meals/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ meals }),
  });

  if (!res.ok) return 0;

  const data = await res.json();

  // Mark all as synced
  const ids = unsynced.map((m) => m.id!).filter(Boolean);
  await offlineDb.mealLogs.where("id").anyOf(ids).modify({ synced: true });

  return data.synced || 0;
}
