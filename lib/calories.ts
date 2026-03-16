export type Sex = "male" | "female";
export type ActivityLevel = "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extra_active";
export type GoalType = "cut" | "maintain" | "bulk";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

const GOAL_ADJUSTMENTS: Record<GoalType, number> = {
  cut: -500,
  maintain: 0,
  bulk: 300,
};

const MACRO_SPLITS: Record<GoalType, { protein: number; carbs: number; fat: number }> = {
  cut: { protein: 0.35, carbs: 0.35, fat: 0.30 },
  maintain: { protein: 0.30, carbs: 0.40, fat: 0.30 },
  bulk: { protein: 0.30, carbs: 0.45, fat: 0.25 },
};

/** Mifflin-St Jeor BMR */
export function calculateBMR(weightKg: number, heightCm: number, age: number, sex: Sex): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

export function calculateTargetCalories(tdee: number, goalType: GoalType): number {
  return Math.round(tdee + GOAL_ADJUSTMENTS[goalType]);
}

export function calculateMacros(calories: number, goalType: GoalType) {
  const split = MACRO_SPLITS[goalType];
  return {
    protein_g: Math.round((calories * split.protein) / 4),
    carbs_g: Math.round((calories * split.carbs) / 4),
    fat_g: Math.round((calories * split.fat) / 9),
  };
}

export function calculateAllTargets(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: Sex,
  activityLevel: ActivityLevel,
  goalType: GoalType,
) {
  const bmr = calculateBMR(weightKg, heightCm, age, sex);
  const tdee = calculateTDEE(bmr, activityLevel);
  const calories = calculateTargetCalories(tdee, goalType);
  const macros = calculateMacros(calories, goalType);
  return { bmr, tdee, daily_calorie_target: calories, ...macros };
}
