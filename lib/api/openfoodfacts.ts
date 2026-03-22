import type { FoodSearchResult } from "./types";

const OFF_BASE = "https://world.openfoodfacts.net/api/v2/product";
const FIELDS = "product_name,brands,serving_size,nutriments";

export async function lookupBarcodeOFF(barcode: string): Promise<FoodSearchResult | null> {
  try {
    const res = await fetch(`${OFF_BASE}/${barcode}?fields=${FIELDS}`, {
      headers: { "User-Agent": "Sahha/1.0 (nutrition PWA)" },
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data.status !== 1 || !data.product) return null;

    const p = data.product;
    const n = p.nutriments ?? {};

    const calories = n["energy-kcal_100g"] ?? n["energy-kcal"] ?? 0;
    const protein = n["proteins_100g"] ?? n["proteins"] ?? 0;
    const carbs = n["carbohydrates_100g"] ?? n["carbohydrates"] ?? 0;
    const fat = n["fat_100g"] ?? n["fat"] ?? 0;
    const fiber = n["fiber_100g"] ?? n["fiber"] ?? 0;

    // Require at least a name and non-zero calories to consider the entry usable
    if (!p.product_name || calories === 0) return null;

    return {
      id: `off_${barcode}`,
      name: p.product_name as string,
      brand: p.brands as string | undefined,
      source: "openfoodfacts",
      nutrition: {
        calories,
        protein_g: protein,
        carbs_g: carbs,
        fat_g: fat,
        fiber_g: fiber,
        serving_size: (p.serving_size as string) || "100g",
      },
    };
  } catch {
    return null;
  }
}
