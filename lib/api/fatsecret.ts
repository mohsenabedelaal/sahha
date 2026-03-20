import type { FoodSearchResult, NutritionInfo } from "./types";

let cachedToken: { access_token: string; expires_at: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires_at) {
    return cachedToken.access_token;
  }

  const clientId = process.env.FATSECRET_CLIENT_ID;
  const clientSecret = process.env.FATSECRET_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("FATSECRET_CLIENT_ID and FATSECRET_CLIENT_SECRET must be set");
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch("https://oauth.fatsecret.com/connect/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials&scope=basic barcode",
  });

  if (!res.ok) throw new Error(`FatSecret auth failed: ${res.status}`);

  const data = await res.json();
  cachedToken = {
    access_token: data.access_token,
    expires_at: Date.now() + (data.expires_in - 60) * 1000,
  };

  return data.access_token;
}

async function apiCall(method: string, params: Record<string, string>) {
  const token = await getAccessToken();
  const query = new URLSearchParams({ method, format: "json", ...params });

  const res = await fetch(`https://platform.fatsecret.com/rest/server.api?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(`FatSecret API error: ${res.status}`);
  return res.json();
}

function parseNutrition(serving: Record<string, string>): NutritionInfo {
  const metricSize = serving.metric_serving_amount && serving.metric_serving_unit
    ? `${serving.metric_serving_amount}${serving.metric_serving_unit}`
    : null;
  return {
    calories: parseFloat(serving.calories || "0"),
    protein_g: parseFloat(serving.protein || "0"),
    carbs_g: parseFloat(serving.carbohydrate || "0"),
    fat_g: parseFloat(serving.fat || "0"),
    fiber_g: parseFloat(serving.fiber || "0"),
    serving_size: serving.serving_description || metricSize || "1 serving",
  };
}

export async function searchFoods(query: string, maxResults = 15): Promise<FoodSearchResult[]> {
  const data = await apiCall("foods.search", {
    search_expression: query,
    max_results: String(maxResults),
  });

  const foods = data?.foods?.food;
  if (!foods) return [];

  const foodList = Array.isArray(foods) ? foods : [foods];

  return foodList.map((f: Record<string, string>) => {
    const desc = f.food_description || "";
    const match = desc.match(
      /Calories:\s*([\d.]+).*Fat:\s*([\d.]+)g.*Carbs:\s*([\d.]+)g.*Protein:\s*([\d.]+)g/i
    );
    const servingMatch = desc.match(/^Per\s+(.+?)\s*-/i);

    return {
      id: f.food_id,
      name: f.food_name,
      brand: f.brand_name,
      source: "fatsecret" as const,
      nutrition: {
        calories: match ? parseFloat(match[1]) : 0,
        fat_g: match ? parseFloat(match[2]) : 0,
        carbs_g: match ? parseFloat(match[3]) : 0,
        protein_g: match ? parseFloat(match[4]) : 0,
        fiber_g: 0,
        serving_size: servingMatch ? servingMatch[1] : "1 serving",
      },
    };
  });
}

export async function lookupBarcode(barcode: string): Promise<FoodSearchResult | null> {
  try {
    const data = await apiCall("food.find_id_for_barcode", { barcode });
    const foodId = data?.food_id?.value;
    if (!foodId) return null;

    const foodData = await apiCall("food.get.v4", { food_id: foodId });
    const food = foodData?.food;
    if (!food) return null;

    const servings = food.servings?.serving;
    const serving = Array.isArray(servings) ? servings[0] : servings;
    if (!serving) return null;

    return {
      id: food.food_id,
      name: food.food_name,
      brand: food.brand_name,
      source: "fatsecret",
      nutrition: parseNutrition(serving),
    };
  } catch {
    return null;
  }
}

export async function getFood(foodId: string): Promise<FoodSearchResult | null> {
  try {
    const data = await apiCall("food.get.v4", { food_id: foodId });
    const food = data?.food;
    if (!food) return null;

    const servings = food.servings?.serving;
    const serving = Array.isArray(servings) ? servings[0] : servings;
    if (!serving) return null;

    return {
      id: food.food_id,
      name: food.food_name,
      brand: food.brand_name,
      source: "fatsecret",
      nutrition: parseNutrition(serving),
    };
  } catch {
    return null;
  }
}

export async function autocomplete(expression: string): Promise<string[]> {
  try {
    const data = await apiCall("foods.autocomplete", {
      expression,
      max_results: "5",
    });
    const suggestions = data?.suggestions?.suggestion;
    if (!suggestions) return [];
    return Array.isArray(suggestions) ? suggestions : [suggestions];
  } catch {
    return [];
  }
}
