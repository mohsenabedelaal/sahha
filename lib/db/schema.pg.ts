import { pgTable, text, integer, real, boolean, timestamp, serial } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
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
  onboarding_complete: boolean("onboarding_complete").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const foodItems = pgTable("food_items", {
  id: serial("id").primaryKey(),
  fatsecret_id: text("fatsecret_id"),
  external_id: text("external_id"),
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
  image_url: text("image_url"),
  is_local: boolean("is_local").default(false),
  barcode: text("barcode"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const mealLogs = pgTable("meal_logs", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id),
  food_item_id: integer("food_item_id").references(() => foodItems.id),
  meal_type: text("meal_type").notNull(),
  servings: real("servings").default(1).notNull(),
  calories: real("calories").notNull(),
  protein_g: real("protein_g").notNull(),
  carbs_g: real("carbs_g").notNull(),
  fat_g: real("fat_g").notNull(),
  logged_at: timestamp("logged_at").defaultNow().notNull(),
});

export const mealPlans = pgTable("meal_plans", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  total_calories: integer("total_calories"),
  is_active: boolean("is_active").default(false),
  week_start_date: text("week_start_date"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const mealPlanItems = pgTable("meal_plan_items", {
  id: serial("id").primaryKey(),
  meal_plan_id: integer("meal_plan_id").notNull().references(() => mealPlans.id),
  food_item_id: integer("food_item_id").notNull().references(() => foodItems.id),
  meal_type: text("meal_type").notNull(),
  servings: real("servings").default(1).notNull(),
  day_of_week: integer("day_of_week"),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  name_ar: text("name_ar"),
  description: text("description").notNull(),
  icon: text("icon"),
  xp_reward: integer("xp_reward").default(0).notNull(),
  condition_type: text("condition_type").notNull(),
  condition_value: integer("condition_value").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id),
  achievement_id: integer("achievement_id").notNull().references(() => achievements.id),
  earned_at: timestamp("earned_at").defaultNow().notNull(),
});

export const dailyChallenges = pgTable("daily_challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  title_ar: text("title_ar"),
  description: text("description").notNull(),
  xp_reward: integer("xp_reward").default(50).notNull(),
  challenge_type: text("challenge_type").notNull(),
  target_value: integer("target_value").notNull(),
  date: text("date").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const educationContent = pgTable("education_content", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  title_ar: text("title_ar"),
  content: text("content").notNull(),
  category: text("category").notNull(),
  difficulty_level: text("difficulty_level").default("beginner").notNull(),
  xp_reward: integer("xp_reward").default(25).notNull(),
  order_index: integer("order_index").default(0).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const notificationSubscriptions = pgTable("notification_subscriptions", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  education_content_id: integer("education_content_id").references(() => educationContent.id),
  question: text("question").notNull(),
  options: text("options").notNull(), // JSON array
  correct_index: integer("correct_index").notNull(),
  explanation: text("explanation").notNull(),
  xp_reward: integer("xp_reward").default(25).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const userEducationProgress = pgTable("user_education_progress", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id),
  education_content_id: integer("education_content_id").notNull().references(() => educationContent.id),
  completed_at: timestamp("completed_at").defaultNow().notNull(),
});

export const userQuizResults = pgTable("user_quiz_results", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id),
  quiz_question_id: integer("quiz_question_id").notNull().references(() => quizQuestions.id),
  answered_correctly: boolean("answered_correctly").notNull(),
  answered_at: timestamp("answered_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id),
  role: text("role").notNull(), // "user" | "assistant"
  content: text("content").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const userChallengeProgress = pgTable("user_challenge_progress", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id),
  challenge_id: integer("challenge_id").notNull().references(() => dailyChallenges.id),
  current_value: integer("current_value").default(0).notNull(),
  completed: boolean("completed").default(false),
  date: text("date").notNull(),
});

export const waterLogs = pgTable("water_logs", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id),
  amount_ml: integer("amount_ml").notNull(),
  logged_at: timestamp("logged_at").defaultNow().notNull(),
});
