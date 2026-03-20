import type { ParsedFood } from "./types";

const APP_ID = process.env.EDAMAM_APP_ID!;
const APP_KEY = process.env.EDAMAM_APP_KEY!;
const BASE_URL = "https://api.edamam.com/api/nutrition-data";

export async function parseNaturalLanguage(text: string): Promise<ParsedFood[]> {
  const url = `${BASE_URL}?app_id=${APP_ID}&app_key=${APP_KEY}&nutrition-type=logging&ingr=${encodeURIComponent(text)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Edamam API error: ${res.status}`);

  const data = await res.json();

  if (!data.ingredients || data.ingredients.length === 0) {
    return [];
  }

  return data.ingredients.map(
    (ing: {
      text: string;
      parsed?: Array<{
        food: string;
        quantity: number;
        measure: string;
        nutrients: {
          ENERC_KCAL?: { quantity: number };
          PROCNT?: { quantity: number };
          CHOCDF?: { quantity: number };
          FAT?: { quantity: number };
          FIBTG?: { quantity: number };
        };
        weight: number;
      }>;
    }) => {
      const parsed = ing.parsed?.[0];
      if (!parsed) {
        return {
          name: ing.text,
          quantity: 1,
          unit: "serving",
          nutrition: {
            calories: 0,
            protein_g: 0,
            carbs_g: 0,
            fat_g: 0,
            serving_size: "unknown",
          },
        };
      }

      return {
        name: parsed.food,
        quantity: parsed.quantity,
        unit: parsed.measure,
        nutrition: {
          calories: Math.round(parsed.nutrients.ENERC_KCAL?.quantity || 0),
          protein_g: Math.round((parsed.nutrients.PROCNT?.quantity || 0) * 10) / 10,
          carbs_g: Math.round((parsed.nutrients.CHOCDF?.quantity || 0) * 10) / 10,
          fat_g: Math.round((parsed.nutrients.FAT?.quantity || 0) * 10) / 10,
          fiber_g: Math.round((parsed.nutrients.FIBTG?.quantity || 0) * 10) / 10,
          serving_size: `${parsed.quantity} ${parsed.measure} (${Math.round(parsed.weight)}g)`,
        },
      };
    }
  );
}
