import type { FoodSearchResult } from "./types";

export async function lookupBarcode(barcode: string): Promise<FoodSearchResult | null> {
  const res = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
    { headers: { "User-Agent": "Sahha Nutrition App/1.0" } }
  );

  if (!res.ok) return null;

  const data = await res.json();
  if (data.status !== 1 || !data.product) return null;

  const p = data.product;
  const nutriments = p.nutriments || {};

  return {
    id: barcode,
    name: p.product_name || p.product_name_en || "Unknown Product",
    brand: p.brands,
    source: "openfoodfacts",
    nutrition: {
      calories: Math.round(nutriments["energy-kcal_100g"] || nutriments["energy-kcal"] || 0),
      protein_g: Math.round((nutriments.proteins_100g || 0) * 10) / 10,
      carbs_g: Math.round((nutriments.carbohydrates_100g || 0) * 10) / 10,
      fat_g: Math.round((nutriments.fat_100g || 0) * 10) / 10,
      fiber_g: Math.round((nutriments.fiber_100g || 0) * 10) / 10,
      serving_size: p.serving_size || "100g",
    },
  };
}
