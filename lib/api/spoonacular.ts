const API_KEY = process.env.SPOONACULAR_API_KEY!;
const BASE = "https://api.spoonacular.com";

interface SpoonacularMeal {
  id: number;
  title: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl: string;
  image: string;
}

interface SpoonacularNutrient {
  name: string;
  amount: number;
  unit: string;
}

interface SpoonacularPlan {
  meals: SpoonacularMeal[];
  nutrients: { calories: number; protein: number; fat: number; carbohydrates: number };
}

export interface MealPlanDay {
  meals: Array<{
    id: number;
    title: string;
    image: string;
    readyInMinutes: number;
    servings: number;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    sourceUrl: string;
    meal_type: string;
  }>;
  totals: { calories: number; protein_g: number; carbs_g: number; fat_g: number };
}

export async function generateDayPlan(targetCalories: number, diet?: string): Promise<MealPlanDay> {
  const params = new URLSearchParams({
    apiKey: API_KEY,
    targetCalories: String(targetCalories),
    timeFrame: "day",
  });
  if (diet) params.set("diet", diet);

  const res = await fetch(`${BASE}/mealplanner/generate?${params}`);
  if (!res.ok) throw new Error(`Spoonacular error: ${res.status}`);

  const data: SpoonacularPlan = await res.json();
  const mealTypes = ["breakfast", "lunch", "dinner"];

  const meals = data.meals.map((m, i) => ({
    id: m.id,
    title: m.title,
    image: `https://img.spoonacular.com/recipes/${m.id}-312x231.jpg`,
    readyInMinutes: m.readyInMinutes,
    servings: m.servings,
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    sourceUrl: m.sourceUrl,
    meal_type: mealTypes[i] || "snack",
  }));

  // Get nutrition for each recipe
  for (const meal of meals) {
    try {
      const info = await getRecipeNutrition(meal.id);
      meal.calories = info.calories;
      meal.protein_g = info.protein_g;
      meal.carbs_g = info.carbs_g;
      meal.fat_g = info.fat_g;
    } catch {
      // use plan-level estimates
    }
  }

  // If individual recipe nutrition failed, distribute plan totals
  const hasNutrition = meals.some((m) => m.calories > 0);
  if (!hasNutrition) {
    const perMeal = {
      calories: Math.round(data.nutrients.calories / meals.length),
      protein_g: Math.round(data.nutrients.protein / meals.length),
      carbs_g: Math.round(data.nutrients.carbohydrates / meals.length),
      fat_g: Math.round(data.nutrients.fat / meals.length),
    };
    for (const meal of meals) {
      meal.calories = perMeal.calories;
      meal.protein_g = perMeal.protein_g;
      meal.carbs_g = perMeal.carbs_g;
      meal.fat_g = perMeal.fat_g;
    }
  }

  return {
    meals,
    totals: {
      calories: meals.reduce((s, m) => s + m.calories, 0),
      protein_g: meals.reduce((s, m) => s + m.protein_g, 0),
      carbs_g: meals.reduce((s, m) => s + m.carbs_g, 0),
      fat_g: meals.reduce((s, m) => s + m.fat_g, 0),
    },
  };
}

async function getRecipeNutrition(recipeId: number) {
  const res = await fetch(
    `${BASE}/recipes/${recipeId}/nutritionWidget.json?apiKey=${API_KEY}`
  );
  if (!res.ok) throw new Error(`Nutrition fetch failed`);

  const data: { nutrients: SpoonacularNutrient[] } = await res.json();
  const get = (name: string) =>
    data.nutrients.find((n) => n.name.toLowerCase() === name.toLowerCase())?.amount || 0;

  return {
    calories: Math.round(get("Calories")),
    protein_g: Math.round(get("Protein")),
    carbs_g: Math.round(get("Carbohydrates")),
    fat_g: Math.round(get("Fat")),
  };
}

export async function getSimilarRecipes(recipeId: number, count = 5) {
  const res = await fetch(
    `${BASE}/recipes/${recipeId}/similar?apiKey=${API_KEY}&number=${count}`
  );
  if (!res.ok) return [];
  return res.json();
}
