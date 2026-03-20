/**
 * FatSecret Platform API wrapper
 * Uses OAuth 2.0 client credentials flow.
 * Docs: https://platform.fatsecret.com/api/Default.aspx?screen=rapih
 */

const TOKEN_URL = "https://oauth.fatsecret.com/connect/token";
const API_BASE = "https://platform.fatsecret.com/rest/server.api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FoodItem {
  fatsecret_id: string;
  name: string;
  brand: string | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  serving_size: string;
  serving_unit: string;
  serving_description: string;
}

// ─── Token cache ──────────────────────────────────────────────────────────────

let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const clientId = process.env.FATSECRET_CLIENT_ID;
  const clientSecret = process.env.FATSECRET_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("FATSECRET_CLIENT_ID and FATSECRET_CLIENT_SECRET must be set");
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials&scope=basic",
  });

  if (!res.ok) {
    throw new Error(`FatSecret token error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  cachedToken = data.access_token as string;
  // Refresh 60 seconds before expiry
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;

  return cachedToken;
}

// ─── API helper ───────────────────────────────────────────────────────────────

async function apiCall(params: Record<string, string | number>): Promise<unknown> {
  const token = await getAccessToken();
  const url = new URL(API_BASE);
  url.searchParams.set("format", "json");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`FatSecret API error: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

// ─── Normalizer ───────────────────────────────────────────────────────────────

// FatSecret returns serving nutrition per serving_description.
// We normalize to the first/default serving.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeServing(foodId: string, foodName: string, brandName: string | null, serving: any): FoodItem {
  const nutrientValue = (key: string): number => {
    const v = serving[key];
    return v != null ? parseFloat(v) : 0;
  };

  const servingDesc: string = serving.serving_description ?? "1 serving";
  // Extract numeric serving size from description like "100 g" or "1 cup (240 ml)"
  const sizeMatch = servingDesc.match(/^([\d.]+)\s*(\w+)/);
  const servingSize = sizeMatch ? sizeMatch[1] : "1";
  const servingUnit = sizeMatch ? sizeMatch[2] : "serving";

  return {
    fatsecret_id: foodId,
    name: foodName,
    brand: brandName,
    calories: nutrientValue("calories"),
    protein_g: nutrientValue("protein"),
    carbs_g: nutrientValue("carbohydrate"),
    fat_g: nutrientValue("fat"),
    fiber_g: nutrientValue("fiber"),
    serving_size: servingSize,
    serving_unit: servingUnit,
    serving_description: servingDesc,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Search foods by text query. Returns up to 20 results per page.
 */
export async function searchFoods(
  query: string,
  pageNumber = 0,
): Promise<FoodItem[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await apiCall({
    method: "foods.search",
    search_expression: query,
    page_number: pageNumber,
    max_results: 20,
  }) as any;

  const foods = data?.foods?.food;
  if (!foods) return [];

  const list = Array.isArray(foods) ? foods : [foods];

  // foods.search returns summary data — we return lightweight items from it
  return list.map((f: any): FoodItem => {
    // food_description example: "Per 100g - Calories: 165kcal | Fat: 3.57g | Carbs: 0g | Protein: 31.02g"
    const desc: string = f.food_description ?? "";
    const cal = parseFloat(desc.match(/Calories:\s*([\d.]+)/i)?.[1] ?? "0");
    const fat = parseFloat(desc.match(/Fat:\s*([\d.]+)/i)?.[1] ?? "0");
    const carbs = parseFloat(desc.match(/Carbs:\s*([\d.]+)/i)?.[1] ?? "0");
    const protein = parseFloat(desc.match(/Protein:\s*([\d.]+)/i)?.[1] ?? "0");
    const serving_desc = desc.split(" - ")[0]?.trim() ?? "Per serving";

    const sizeMatch = serving_desc.match(/^Per\s+([\d.]+)\s*(\w+)/i);
    const servingSize = sizeMatch ? sizeMatch[1] : "1";
    const servingUnit = sizeMatch ? sizeMatch[2] : "serving";

    return {
      fatsecret_id: String(f.food_id),
      name: f.food_name,
      brand: f.brand_name ?? null,
      calories: cal,
      protein_g: protein,
      carbs_g: carbs,
      fat_g: fat,
      fiber_g: 0,
      serving_size: servingSize,
      serving_unit: servingUnit,
      serving_description: serving_desc,
    };
  });
}

/**
 * Get full nutrition details for a food by its FatSecret food ID.
 * Returns the first (default) serving.
 */
export async function getFood(foodId: string): Promise<FoodItem | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await apiCall({ method: "food.get", food_id: foodId }) as any;
  const food = data?.food;
  if (!food) return null;

  const servings = food.servings?.serving;
  if (!servings) return null;

  const serving = Array.isArray(servings) ? servings[0] : servings;
  return normalizeServing(String(food.food_id), food.food_name, food.brand_name ?? null, serving);
}

/**
 * Look up a food by barcode (EAN/UPC). Returns null if not found.
 */
export async function findByBarcode(barcode: string): Promise<FoodItem | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await apiCall({
    method: "food.find_id_for_barcode",
    barcode,
  }) as any;

  const foodId = data?.food_id?.value;
  if (!foodId) return null;

  return getFood(String(foodId));
}

/**
 * Autocomplete food names for a partial expression. Returns up to 5 names.
 */
export async function autocomplete(expression: string): Promise<string[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await apiCall({
    method: "foods.autocomplete",
    expression,
    max_results: 5,
  }) as any;

  const suggestions = data?.suggestions?.suggestion;
  if (!suggestions) return [];
  return Array.isArray(suggestions) ? suggestions : [suggestions];
}
