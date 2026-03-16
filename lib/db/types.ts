import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type * as schema from "./schema";

export type User = InferSelectModel<typeof schema.users>;
export type NewUser = InferInsertModel<typeof schema.users>;

export type FoodItem = InferSelectModel<typeof schema.foodItems>;
export type NewFoodItem = InferInsertModel<typeof schema.foodItems>;

export type MealLog = InferSelectModel<typeof schema.mealLogs>;
export type NewMealLog = InferInsertModel<typeof schema.mealLogs>;

export type MealPlan = InferSelectModel<typeof schema.mealPlans>;
export type NewMealPlan = InferInsertModel<typeof schema.mealPlans>;

export type MealPlanItem = InferSelectModel<typeof schema.mealPlanItems>;
export type NewMealPlanItem = InferInsertModel<typeof schema.mealPlanItems>;

export type Achievement = InferSelectModel<typeof schema.achievements>;
export type NewAchievement = InferInsertModel<typeof schema.achievements>;

export type UserAchievement = InferSelectModel<typeof schema.userAchievements>;
export type NewUserAchievement = InferInsertModel<typeof schema.userAchievements>;

export type DailyChallenge = InferSelectModel<typeof schema.dailyChallenges>;
export type NewDailyChallenge = InferInsertModel<typeof schema.dailyChallenges>;

export type EducationContent = InferSelectModel<typeof schema.educationContent>;
export type NewEducationContent = InferInsertModel<typeof schema.educationContent>;

export type WaterLog = InferSelectModel<typeof schema.waterLogs>;
export type NewWaterLog = InferInsertModel<typeof schema.waterLogs>;
