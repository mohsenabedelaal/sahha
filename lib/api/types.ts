export interface NutritionInfo {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  serving_size: string;
}

export interface FoodRecognitionResult {
  name: string;
  nutrition: NutritionInfo;
  confidence: number;
}

export interface FoodSearchResult {
  id: string;
  name: string;
  brand?: string;
  nutrition: NutritionInfo;
  source: "fatsecret" | "openfoodfacts" | "edamam";
}

export interface ParsedFood {
  name: string;
  quantity: number;
  unit: string;
  nutrition: NutritionInfo;
}

export interface BarcodeResult {
  found: boolean;
  food?: FoodSearchResult;
  source?: "fatsecret" | "openfoodfacts";
}

export interface FoodExplanation {
  explanation: string;
  food_name: string;
}
