"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FoodSearch } from "@/components/meals/FoodSearch";
import { PhotoCapture } from "@/components/meals/PhotoCapture";
import { BarcodeScanner } from "@/components/meals/BarcodeScanner";
import { MealCard } from "@/components/meals/MealCard";
import { useMealStore } from "@/stores/mealStore";
import type { FoodItem } from "@/lib/api/fatsecret";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "search" | "barcode" | "photo" | "text";
type MealType = "breakfast" | "lunch" | "dinner" | "snack";

interface LoggedMeal {
  id: number;
  food_item_id: number | null;
  meal_type: string;
  servings: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  logged_at: string;
  food_name: string | null;
  food_brand: string | null;
  food_serving_size: string | null;
  food_serving_unit: string | null;
}

interface PendingFood {
  food: FoodItem | {
    name: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
    serving_size: string;
    serving_unit?: string;
    source?: string;
    fatsecret_id?: string;
    brand?: string | null;
  };
  meal_type: MealType;
  servings: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function groupByMealType(meals: LoggedMeal[]): Record<string, LoggedMeal[]> {
  return meals.reduce<Record<string, LoggedMeal[]>>((acc, m) => {
    if (!acc[m.meal_type]) acc[m.meal_type] = [];
    acc[m.meal_type].push(m);
    return acc;
  }, {});
}

// ─── Log Form ─────────────────────────────────────────────────────────────────

function LogForm({
  food,
  onConfirm,
  onCancel,
}: {
  food: PendingFood["food"];
  onConfirm: (mealType: MealType, servings: number) => void;
  onCancel: () => void;
}) {
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [servings, setServings] = useState("1");
  const [logging, setLogging] = useState(false);

  async function submit() {
    const s = parseFloat(servings) || 1;
    setLogging(true);
    await onConfirm(mealType, s);
    setLogging(false);
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-surface-2 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">{food.name}</p>
          {"brand" in food && food.brand && (
            <p className="text-xs text-muted">{food.brand}</p>
          )}
          <p className="text-sm text-mint font-mono">{Math.round(food.calories)} kcal / serving</p>
        </div>
        <button onClick={onCancel} className="text-muted hover:text-foreground text-xl">×</button>
      </div>

      <div className="flex flex-wrap gap-2">
        {MEAL_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setMealType(t)}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
              mealType === t ? "bg-mint text-background font-semibold" : "bg-surface text-muted hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm text-muted w-16 shrink-0">Servings</label>
        <input
          type="number"
          min="0.1"
          step="0.1"
          value={servings}
          onChange={(e) => setServings(e.target.value)}
          className="w-24 rounded-xl bg-surface px-3 py-2 text-sm text-foreground border border-transparent focus:border-mint focus:ring-2 focus:ring-mint/20 focus:outline-none"
        />
        <p className="text-sm text-muted">
          = {Math.round(food.calories * (parseFloat(servings) || 1))} kcal total
        </p>
      </div>

      <Button onClick={submit} loading={logging} className="w-full">
        Log Meal
      </Button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LogPage() {
  const [activeTab, setActiveTab] = useState<Tab>("search");
  const [todayLogs, setTodayLogs] = useState<LoggedMeal[]>([]);
  const [pending, setPending] = useState<PendingFood | null>(null);
  const [pendingMulti, setPendingMulti] = useState<PendingFood[]>([]);
  const [textInput, setTextInput] = useState("");
  const [textLoading, setTextLoading] = useState(false);
  const [textError, setTextError] = useState<string | null>(null);
  const { addMeal, removeMeal } = useMealStore();

  const loadTodayLogs = useCallback(async () => {
    const res = await fetch(`/api/meals/log?date=${todayISO()}`);
    if (res.ok) {
      const data = await res.json();
      setTodayLogs(data.logs ?? []);
    }
  }, []);

  useEffect(() => {
    loadTodayLogs();
  }, [loadTodayLogs]);

  // ── Log a single food ──────────────────────────────────────────────────────

  async function logFood(food: PendingFood["food"], mealType: MealType, servings: number) {
    const res = await fetch("/api/meals/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ food, meal_type: mealType, servings }),
    });

    if (res.ok) {
      const data = await res.json();
      const log: LoggedMeal = {
        id: data.log.id,
        food_item_id: data.log.food_item_id,
        meal_type: mealType,
        servings,
        calories: food.calories * servings,
        protein_g: food.protein_g * servings,
        carbs_g: food.carbs_g * servings,
        fat_g: food.fat_g * servings,
        logged_at: data.log.logged_at,
        food_name: food.name,
        food_brand: "brand" in food ? (food.brand ?? null) : null,
        food_serving_size: food.serving_size,
        food_serving_unit: food.serving_unit ?? null,
      };
      setTodayLogs((prev) => [...prev, log]);
      addMeal({
        id: String(log.id),
        name: food.name,
        meal_type: mealType,
        calories: log.calories,
        protein_g: log.protein_g,
        carbs_g: log.carbs_g,
        fat_g: log.fat_g,
        servings,
        logged_at: log.logged_at,
      });
    }
  }

  async function handleSingleConfirm(mealType: MealType, servings: number) {
    if (!pending) return;
    await logFood(pending.food, mealType, servings);
    setPending(null);
  }

  // ── Photo: log all recognized foods ───────────────────────────────────────

  function handlePhotosRecognized(
    foods: { name: string; estimated_grams: number; calories: number; protein_g: number; carbs_g: number; fat_g: number; fiber_g: number; confidence: number }[],
    mealTypeGuess: string,
  ) {
    const validMealType = (MEAL_TYPES as string[]).includes(mealTypeGuess) ? (mealTypeGuess as MealType) : "lunch";
    const multi: PendingFood[] = foods.map((f) => ({
      food: {
        name: f.name,
        calories: f.calories,
        protein_g: f.protein_g,
        carbs_g: f.carbs_g,
        fat_g: f.fat_g,
        fiber_g: f.fiber_g,
        serving_size: String(f.estimated_grams),
        serving_unit: "g",
        source: "claude",
      },
      meal_type: validMealType,
      servings: 1,
    }));
    setPendingMulti(multi);
  }

  async function handleLogAllPhoto(mealType: MealType) {
    for (const p of pendingMulti) {
      await logFood(p.food, mealType, p.servings);
    }
    setPendingMulti([]);
  }

  // ── Text NLP ───────────────────────────────────────────────────────────────

  async function handleTextParse() {
    if (!textInput.trim()) return;
    setTextLoading(true);
    setTextError(null);

    try {
      const res = await fetch("/api/nutrition/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textInput }),
      });

      if (!res.ok) throw new Error("Parse failed");

      const data = await res.json();
      const validMealType = (MEAL_TYPES as string[]).includes(data.meal_type_guess ?? "")
        ? (data.meal_type_guess as MealType)
        : "lunch";

      const multi: PendingFood[] = (data.foods ?? []).map((f: { name: string; estimated_grams: number; calories: number; protein_g: number; carbs_g: number; fat_g: number; fiber_g: number }) => ({
        food: {
          name: f.name,
          calories: f.calories,
          protein_g: f.protein_g,
          carbs_g: f.carbs_g,
          fat_g: f.fat_g,
          fiber_g: f.fiber_g,
          serving_size: String(f.estimated_grams),
          serving_unit: "g",
          source: "claude",
        },
        meal_type: validMealType,
        servings: 1,
      }));

      setPendingMulti(multi);
      setTextInput("");
    } catch {
      setTextError("Could not parse that. Try being more specific.");
    } finally {
      setTextLoading(false);
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  function handleDelete(id: number) {
    setTodayLogs((prev) => prev.filter((l) => l.id !== id));
    removeMeal(String(id));
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  const grouped = groupByMealType(todayLogs);

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: "search", label: "Search", emoji: "🔍" },
    { id: "barcode", label: "Barcode", emoji: "📦" },
    { id: "photo", label: "Photo", emoji: "📷" },
    { id: "text", label: "Text", emoji: "✏️" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Food Log</h1>

      {/* Tab switcher */}
      <div className="flex gap-2 bg-surface-2 rounded-2xl p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => { setActiveTab(t.id); setPending(null); setPendingMulti([]); }}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl text-xs transition-colors ${
              activeTab === t.id ? "bg-surface text-foreground font-semibold" : "text-muted hover:text-foreground"
            }`}
          >
            <span>{t.emoji}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <Card>
        {activeTab === "search" && (
          <div className="flex flex-col gap-3">
            <FoodSearch
              onSelect={(food) => setPending({ food, meal_type: "breakfast", servings: 1 })}
            />
            {pending && (
              <LogForm
                food={pending.food}
                onConfirm={handleSingleConfirm}
                onCancel={() => setPending(null)}
              />
            )}
          </div>
        )}

        {activeTab === "barcode" && (
          <div className="flex flex-col gap-3">
            <BarcodeScanner
              onFoodFound={(food) => setPending({ food, meal_type: "breakfast", servings: 1 })}
            />
            {pending && (
              <LogForm
                food={pending.food}
                onConfirm={handleSingleConfirm}
                onCancel={() => setPending(null)}
              />
            )}
          </div>
        )}

        {activeTab === "photo" && (
          <div className="flex flex-col gap-3">
            {pendingMulti.length === 0 ? (
              <PhotoCapture onFoodsRecognized={handlePhotosRecognized} />
            ) : (
              <MultiConfirm
                items={pendingMulti}
                onConfirm={handleLogAllPhoto}
                onCancel={() => setPendingMulti([])}
              />
            )}
          </div>
        )}

        {activeTab === "text" && (
          <div className="flex flex-col gap-3">
            {pendingMulti.length === 0 ? (
              <>
                <p className="text-sm text-muted">
                  Describe what you ate in plain English, e.g. &quot;2 scrambled eggs and toast with butter&quot;
                </p>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="I ate..."
                  rows={3}
                  className="w-full rounded-xl bg-surface-2 px-4 py-3 text-foreground placeholder:text-muted/60 border border-transparent focus:border-mint focus:ring-2 focus:ring-mint/20 focus:outline-none transition-colors resize-none"
                />
                {textError && <p className="text-sm text-red">{textError}</p>}
                <Button
                  onClick={handleTextParse}
                  loading={textLoading}
                  disabled={!textInput.trim()}
                  className="w-full"
                >
                  Parse & Log
                </Button>
              </>
            ) : (
              <MultiConfirm
                items={pendingMulti}
                onConfirm={async (mealType) => {
                  await handleLogAllPhoto(mealType);
                }}
                onCancel={() => setPendingMulti([])}
              />
            )}
          </div>
        )}
      </Card>

      {/* Today's logged meals */}
      {todayLogs.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Today&apos;s Meals</h2>
          {(["breakfast", "lunch", "dinner", "snack"] as MealType[]).map((type) => {
            const meals = grouped[type];
            if (!meals?.length) return null;
            return (
              <div key={type} className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-muted capitalize">{type}</h3>
                {meals.map((meal) => (
                  <MealCard
                    key={meal.id}
                    id={meal.id}
                    name={meal.food_name ?? "Unknown food"}
                    brand={meal.food_brand}
                    mealType={meal.meal_type}
                    servings={meal.servings}
                    calories={meal.calories}
                    protein_g={meal.protein_g}
                    carbs_g={meal.carbs_g}
                    fat_g={meal.fat_g}
                    loggedAt={meal.logged_at}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            );
          })}
        </div>
      )}

      {todayLogs.length === 0 && (
        <Card className="flex flex-col items-center py-8 text-center">
          <span className="text-4xl mb-2">🍽️</span>
          <p className="text-muted">No meals logged today yet</p>
          <p className="text-sm text-muted/60 mt-1">Use the tabs above to log your food</p>
        </Card>
      )}
    </div>
  );
}

// ─── Multi-food confirm (for Photo + Text) ────────────────────────────────────

function MultiConfirm({
  items,
  onConfirm,
  onCancel,
}: {
  items: PendingFood[];
  onConfirm: (mealType: MealType) => void;
  onCancel: () => void;
}) {
  const [mealType, setMealType] = useState<MealType>("lunch");
  const [logging, setLogging] = useState(false);

  async function submit() {
    setLogging(true);
    await onConfirm(mealType);
    setLogging(false);
  }

  const total = items.reduce((sum, i) => sum + i.food.calories * i.servings, 0);

  return (
    <div className="flex flex-col gap-3">
      <p className="font-semibold">Log {items.length} food{items.length > 1 ? "s" : ""}</p>

      {items.map((item, i) => (
        <div key={i} className="flex items-center justify-between rounded-xl bg-surface px-3 py-2">
          <div>
            <p className="text-sm font-medium">{item.food.name}</p>
            <p className="text-xs text-muted">
              {item.food.serving_size}{item.food.serving_unit ?? ""}
            </p>
          </div>
          <p className="font-mono text-sm font-semibold text-mint">{Math.round(item.food.calories)} kcal</p>
        </div>
      ))}

      <p className="text-sm text-muted text-right font-mono font-semibold">
        Total: {Math.round(total)} kcal
      </p>

      <div className="flex flex-wrap gap-2">
        {MEAL_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setMealType(t)}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
              mealType === t ? "bg-mint text-background font-semibold" : "bg-surface text-muted hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <Button onClick={submit} loading={logging} className="flex-1">
          Log All
        </Button>
        <Button variant="secondary" onClick={onCancel} disabled={logging}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
