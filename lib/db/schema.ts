import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  name: text("name"),
  age: integer("age"),
  sex: text("sex"),
  height_cm: real("height_cm"),
  weight_kg: real("weight_kg"),
  activity_level: text("activity_level"),
  goal_type: text("goal_type"),
  diet_preference: text("diet_preference"),
  allergies: text("allergies"),
  daily_calorie_target: integer("daily_calorie_target"),
  protein_target_g: integer("protein_target_g"),
  carbs_target_g: integer("carbs_target_g"),
  fat_target_g: integer("fat_target_g"),
  xp: integer("xp").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  streak_days: integer("streak_days").default(0).notNull(),
  best_streak: integer("best_streak").default(0).notNull(),
  onboarding_complete: integer("onboarding_complete", { mode: "boolean" }).default(false).notNull(),
  created_at: text("created_at").default(sql`(datetime('now'))`).notNull(),
  updated_at: text("updated_at").default(sql`(datetime('now'))`).notNull(),
});

export const foodItems = sqliteTable("food_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fatsecret_id: text("fatsecret_id"),
  name: text("name").notNull(),
  name_ar: text("name_ar"),
  brand: text("brand"),
  calories: real("calories").notNull(),
  protein_g: real("protein_g").notNull(),
  carbs_g: real("carbs_g").notNull(),
  fat_g: real("fat_g").notNull(),
  fiber_g: real("fiber_g").default(0),
  serving_size: text("serving_size").notNull(),
  serving_unit: text("serving_unit"),
  category: text("category"),
  source: text("source").default("manual"),
  is_local: integer("is_local", { mode: "boolean" }).default(false),
  barcode: text("barcode"),
  created_at: text("created_at").default(sql`(datetime('now'))`).notNull(),
});

export const mealLogs = sqliteTable("meal_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user_id: integer("user_id").notNull().references(() => users.id),
  food_item_id: integer("food_item_id").references(() => foodItems.id),
  meal_type: text("meal_type").notNull(),
  servings: real("servings").default(1).notNull(),
  calories: real("calories").notNull(),
  protein_g: real("protein_g").notNull(),
  carbs_g: real("carbs_g").notNull(),
  fat_g: real("fat_g").notNull(),
  logged_at: text("logged_at").default(sql`(datetime('now'))`).notNull(),
});

export const mealPlans = sqliteTable("meal_plans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user_id: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  total_calories: integer("total_calories"),
  is_active: integer("is_active", { mode: "boolean" }).default(false),
  created_at: text("created_at").default(sql`(datetime('now'))`).notNull(),
});

export const mealPlanItems = sqliteTable("meal_plan_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  meal_plan_id: integer("meal_plan_id").notNull().references(() => mealPlans.id),
  food_item_id: integer("food_item_id").notNull().references(() => foodItems.id),
  meal_type: text("meal_type").notNull(),
  servings: real("servings").default(1).notNull(),
  day_of_week: integer("day_of_week"),
});

export const achievements = sqliteTable("achievements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  name_ar: text("name_ar"),
  description: text("description").notNull(),
  icon: text("icon"),
  xp_reward: integer("xp_reward").default(0).notNull(),
  condition_type: text("condition_type").notNull(),
  condition_value: integer("condition_value").notNull(),
  created_at: text("created_at").default(sql`(datetime('now'))`).notNull(),
});

export const userAchievements = sqliteTable("user_achievements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user_id: integer("user_id").notNull().references(() => users.id),
  achievement_id: integer("achievement_id").notNull().references(() => achievements.id),
  earned_at: text("earned_at").default(sql`(datetime('now'))`).notNull(),
});

export const dailyChallenges = sqliteTable("daily_challenges", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  title_ar: text("title_ar"),
  description: text("description").notNull(),
  xp_reward: integer("xp_reward").default(50).notNull(),
  challenge_type: text("challenge_type").notNull(),
  target_value: integer("target_value").notNull(),
  date: text("date").notNull(),
  created_at: text("created_at").default(sql`(datetime('now'))`).notNull(),
});

export const educationContent = sqliteTable("education_content", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  title_ar: text("title_ar"),
  content: text("content").notNull(),
  category: text("category").notNull(),
  difficulty_level: text("difficulty_level").default("beginner").notNull(),
  xp_reward: integer("xp_reward").default(25).notNull(),
  order_index: integer("order_index").default(0).notNull(),
  created_at: text("created_at").default(sql`(datetime('now'))`).notNull(),
});

export const notificationSubscriptions = sqliteTable("notification_subscriptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user_id: integer("user_id").notNull().references(() => users.id),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  created_at: text("created_at").default(sql`(datetime('now'))`).notNull(),
});

export const waterLogs = sqliteTable("water_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user_id: integer("user_id").notNull().references(() => users.id),
  amount_ml: integer("amount_ml").notNull(),
  logged_at: text("logged_at").default(sql`(datetime('now'))`).notNull(),
});
