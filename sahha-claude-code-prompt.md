# SAHHA — Gamified Nutrition PWA
## Claude Code Project Initialization Prompt

---

Paste the entire content below into Claude Code as your initial prompt:

---

## PROMPT START:

```
I want you to build "Sahha" (صحة) — a gamified nutrition Progressive Web App. Build it step by step, starting with the project scaffold, then core features one at a time. Don't build everything at once — scaffold first, then we iterate.

## What Sahha Is

A PWA where users track calories, follow personalized meal plans, learn why certain foods matter, get notified at meal times, and earn XP/levels/badges for staying consistent. Think "Duolingo for nutrition."

## Tech Stack (use exactly these)

### Frontend
- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Zustand** for client state (user profile, meals, gamification)
- **TanStack Query (React Query)** for server state
- **Framer Motion** for gamification animations (XP gains, level ups, badge unlocks)
- **Recharts** for calorie/macro dashboard charts

### PWA
- **Serwist** (or next-pwa) for service worker generation
- **Dexie.js** for IndexedDB offline meal log caching
- **web-push** (npm, server-side) for VAPID push notifications
- **html5-qrcode** for browser-based barcode scanning

### Backend & Database
- **Supabase** (PostgreSQL + Auth + Realtime + Storage)
- **Supabase Auth** with email/password + Google OAuth
- **Upstash Redis** for rate limiting and streak caching
- **Vercel Cron Jobs** for scheduled notifications and streak updates

### AI & Food APIs (this is the key architecture)
- **Claude API (Anthropic)** — PRIMARY food photo recognition (multimodal: send image, get food identification + nutrition estimate as structured JSON), AI nutrition coaching, "Why this food?" explainer cards, nutrition chatbot
- **FatSecret Platform API** — Food database (2.3M+ foods, 56 countries), barcode scanning, text search with autocomplete. Using their free Premier tier for startups.
- **Edamam Food Database API** — NLP food parsing ("2 eggs and toast" → structured nutrition), recipe analysis. Free tier: 1,000 requests/day. Their Vision API (10,000 free image calls) as BACKUP for photo recognition.
- **Spoonacular API** — Recipe search (365K+ recipes), weekly meal plan generation, diet filtering, grocery lists. Free tier with daily points quota.
- **Open Food Facts API** — Free barcode scanning fallback for international packaged products
- **USDA FoodData Central** — Free nutrition data verification and ground truth

### Deployment
- **Vercel** (production hosting, cron jobs, edge functions)

## Project Structure

```
sahha/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── onboarding/page.tsx        # Collect goals, body stats, diet prefs
│   ├── (main)/
│   │   ├── dashboard/page.tsx          # Daily overview, calorie ring, macros, streak
│   │   ├── log/page.tsx                # Meal logging (photo + search + barcode + voice)
│   │   ├── plan/page.tsx               # Weekly meal plan with swap
│   │   ├── learn/page.tsx              # Education hub, lessons, quizzes
│   │   ├── profile/page.tsx            # Stats, achievements, settings, notifications
│   │   └── layout.tsx                  # Bottom nav, streak banner
│   ├── api/
│   │   ├── nutrition/
│   │   │   ├── recognize/route.ts      # Claude API: send photo → get food + nutrition JSON
│   │   │   ├── search/route.ts         # FatSecret: text search with autocomplete
│   │   │   ├── barcode/route.ts        # FatSecret → Open Food Facts fallback
│   │   │   └── parse/route.ts          # Edamam NLP: "2 eggs and toast" → nutrition
│   │   ├── meals/
│   │   │   ├── log/route.ts            # CRUD meal logs
│   │   │   └── plan/route.ts           # Spoonacular: generate/get weekly meal plans
│   │   ├── gamification/
│   │   │   ├── xp/route.ts             # Award XP, check level ups
│   │   │   └── achievements/route.ts   # Check and unlock achievements
│   │   ├── ai/
│   │   │   ├── explain/route.ts        # Claude: "Why this food?" cards
│   │   │   └── chat/route.ts           # Claude: nutrition chatbot
│   │   ├── notifications/
│   │   │   └── subscribe/route.ts      # Save push subscription
│   │   └── cron/
│   │       ├── send-reminders/route.ts # Hourly: dispatch meal reminders
│   │       └── update-streaks/route.ts # Midnight: calculate streaks
│   ├── manifest.json
│   └── layout.tsx                      # Root layout, PWA meta tags
├── components/
│   ├── ui/                             # Button, Card, Modal, Input, Badge
│   ├── dashboard/                      # CalorieRing, MacroChart, StreakBanner, WaterTracker
│   ├── meals/                          # FoodSearch, PhotoCapture, BarcodeScanner, MealCard
│   ├── gamification/                   # XPBar, AchievementBadge, StreakFire, LevelUpModal
│   ├── education/                      # LessonCard, QuizCard, WhyThisFood
│   └── InstallBanner.tsx               # PWA install prompt
├── lib/
│   ├── supabase.ts                     # Supabase client (browser + server)
│   ├── db.ts                           # Dexie.js IndexedDB for offline
│   ├── notifications.ts                # Push subscribe/unsubscribe helpers
│   ├── api/
│   │   ├── claude.ts                   # Claude API wrapper (photo recognition + chat)
│   │   ├── fatsecret.ts                # FatSecret API wrapper
│   │   ├── edamam.ts                   # Edamam API wrapper
│   │   ├── spoonacular.ts              # Spoonacular API wrapper
│   │   └── openfoodfacts.ts            # Open Food Facts wrapper
│   ├── calories.ts                     # BMR (Mifflin-St Jeor), TDEE, macro calculations
│   └── gamification.ts                 # XP rules, level thresholds, achievement conditions
├── stores/
│   ├── userStore.ts                    # Zustand: user profile, goals, body stats
│   ├── mealStore.ts                    # Zustand: daily meals, calorie totals
│   └── gameStore.ts                    # Zustand: XP, level, streaks, achievements
├── public/
│   ├── icons/                          # PWA icons (192, 512, maskable)
│   └── manifest.json
├── supabase/
│   └── migrations/                     # SQL schema migrations
├── vercel.json                         # Cron jobs config
├── next.config.ts                      # PWA plugin config
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Database Schema (Supabase PostgreSQL)

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  age INT,
  sex TEXT CHECK (sex IN ('male', 'female')),
  height_cm NUMERIC,
  weight_kg NUMERIC,
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  goal_type TEXT CHECK (goal_type IN ('cut', 'maintain', 'bulk')),
  diet_preference TEXT DEFAULT 'standard',
  allergies TEXT[] DEFAULT '{}',
  target_calories INT,
  target_protein INT,
  target_carbs INT,
  target_fat INT,
  xp INT DEFAULT 0,
  level INT DEFAULT 1,
  streak_days INT DEFAULT 0,
  streak_best INT DEFAULT 0,
  timezone TEXT DEFAULT 'UTC',
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Food items cache
CREATE TABLE food_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT,
  calories NUMERIC,
  protein_g NUMERIC,
  carbs_g NUMERIC,
  fat_g NUMERIC,
  fiber_g NUMERIC,
  barcode TEXT,
  source TEXT CHECK (source IN ('fatsecret', 'edamam', 'usda', 'openfoodfacts', 'claude', 'manual')),
  image_url TEXT,
  serving_size NUMERIC,
  serving_unit TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meal logs
CREATE TABLE meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  food_item_id UUID REFERENCES food_items(id),
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  servings NUMERIC DEFAULT 1,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  photo_url TEXT,
  synced BOOLEAN DEFAULT TRUE
);

-- Meal plans
CREATE TABLE meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  target_calories INT,
  target_protein INT,
  target_carbs INT,
  target_fat INT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'skipped')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meal plan items
CREATE TABLE meal_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
  day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6),
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_item_id UUID REFERENCES food_items(id),
  servings NUMERIC DEFAULT 1,
  recipe_id TEXT,
  recipe_title TEXT,
  recipe_url TEXT
);

-- Achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  xp_reward INT DEFAULT 0,
  condition_type TEXT NOT NULL,
  condition_value INT NOT NULL,
  category TEXT CHECK (category IN ('streak', 'nutrition', 'education', 'social', 'milestone'))
);

-- User achievements
CREATE TABLE user_achievements (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id),
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  progress_current INT DEFAULT 0,
  progress_target INT NOT NULL,
  PRIMARY KEY (user_id, achievement_id)
);

-- Daily challenges
CREATE TABLE daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  xp_reward INT DEFAULT 100,
  completed BOOLEAN DEFAULT FALSE
);

-- Education content
CREATE TABLE education_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body_markdown TEXT,
  type TEXT CHECK (type IN ('lesson', 'myth_buster', 'tip', 'quiz')),
  xp_reward INT DEFAULT 100,
  unlock_at_level INT DEFAULT 1,
  category TEXT,
  sort_order INT DEFAULT 0
);

-- Push notification subscriptions
CREATE TABLE notification_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  meal_times INT[] DEFAULT '{8, 12, 19}',
  push_enabled BOOLEAN DEFAULT TRUE,
  email_fallback BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Water tracking
CREATE TABLE water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  glasses INT DEFAULT 1,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Calorie Calculation Logic

```typescript
// Mifflin-St Jeor BMR
function calculateBMR(weight_kg: number, height_cm: number, age: number, sex: 'male' | 'female'): number {
  if (sex === 'male') return 10 * weight_kg + 6.25 * height_cm - 5 * age + 5;
  return 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;
}

// Activity multipliers
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// Goal adjustments
const GOAL_ADJUSTMENTS = {
  cut: -500,    // 500 calorie deficit
  maintain: 0,
  bulk: 300,    // 300 calorie surplus
};

// Macro splits by goal (protein%, carbs%, fat%)
const MACRO_SPLITS = {
  cut: { protein: 0.35, carbs: 0.35, fat: 0.30 },
  maintain: { protein: 0.30, carbs: 0.40, fat: 0.30 },
  bulk: { protein: 0.30, carbs: 0.45, fat: 0.25 },
};
```

## Gamification Rules

```typescript
// XP rewards
const XP_REWARDS = {
  LOG_MEAL: 10,
  LOG_ALL_MEALS: 50,        // All 3+ meals in a day
  HIT_CALORIE_TARGET: 30,   // Within 10% of target
  HIT_PROTEIN_TARGET: 20,
  COMPLETE_LESSON: 100,
  COMPLETE_QUIZ: 200,
  DAILY_CHALLENGE: 150,
  STREAK_7: 500,
  STREAK_30: 2000,
  FIRST_PHOTO_LOG: 50,
  FIRST_BARCODE_SCAN: 50,
};

// Level thresholds (XP needed for each level)
// Level 1 = 0, Level 2 = 200, Level 3 = 500, etc.
// Formula: level N requires N * 150 + (N-1) * 50 cumulative XP

// Streak multipliers
const STREAK_MULTIPLIERS = {
  0: 1,    // No streak
  3: 1.25, // 3-day streak = 1.25x XP
  7: 1.5,  // 7-day streak = 1.5x
  14: 2,   // 14-day streak = 2x
  30: 3,   // 30-day streak = 3x
  60: 5,   // 60-day streak = 5x
};
```

## Claude API Food Recognition Prompt

When the user uploads a food photo, send it to Claude with this system prompt:

```
You are Sahha's food recognition AI. Analyze the food photo and return ONLY valid JSON (no markdown, no explanation) in this exact format:

{
  "foods": [
    {
      "name": "Grilled Chicken Breast",
      "estimated_grams": 150,
      "confidence": 0.92,
      "calories": 248,
      "protein_g": 46,
      "carbs_g": 0,
      "fat_g": 5.4,
      "fiber_g": 0
    }
  ],
  "meal_type_guess": "lunch",
  "total_calories": 248
}

Rules:
- Identify EVERY distinct food item visible
- Estimate portion sizes in grams based on visual cues
- Provide nutrition per item based on standard USDA values
- confidence is 0-1, how sure you are about the identification
- If you can't identify a food, set confidence below 0.5
- Always return valid JSON, nothing else
```

## Environment Variables Needed

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Claude API
ANTHROPIC_API_KEY=

# FatSecret
FATSECRET_CLIENT_ID=
FATSECRET_CLIENT_SECRET=

# Edamam
EDAMAM_APP_ID=
EDAMAM_APP_KEY=

# Spoonacular
SPOONACULAR_API_KEY=

# Push Notifications (generate with: npx web-push generate-vapid-keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_EMAIL=mailto:hello@sahha.app

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Cron secret
CRON_SECRET=

# Open Food Facts (no key needed - free API)
```

## Design Direction

- Dark theme by default (bg: #0d1117, surfaces: #151b27, #1c2333)
- Primary accent: mint green (#34d399)
- Secondary accents: amber (#fbbf24), sky blue (#38bdf8), violet (#a78bfa)
- Font: "Outfit" from Google Fonts (weights 400-900)
- Monospace: "Space Mono" for numbers/stats
- Playful, game-like energy — not clinical health app vibes
- Generous use of emoji as icons
- Smooth animations on XP gains, level ups, streak milestones
- Mobile-first responsive (375px–430px primary, scales up to desktop)

## Step 1 — What to Build NOW

Scaffold the project with:
1. Next.js 15 App Router + TypeScript + Tailwind v4
2. PWA manifest.json + service worker setup (Serwist)
3. Supabase client configuration (browser + server)
4. The complete database schema (run migrations)
5. Auth pages (login, signup) with Supabase Auth
6. Onboarding flow (collect name, age, sex, height, weight, activity level, goal, diet preference, allergies)
7. BMR/TDEE calculator that runs on onboarding completion and sets calorie/macro targets
8. Basic dashboard layout with bottom navigation
9. The calorie ring component (SVG animated ring showing consumed/target)
10. Zustand stores (userStore, mealStore, gameStore)
11. Environment variable setup (.env.local template)

Do NOT build yet: food recognition, meal plans, notifications, gamification engine, education content. We will add those in subsequent iterations.

Start building Step 1 now. Create every file, write production-quality code, and make it actually work.
```

---

## FOLLOW-UP PROMPTS (use these after Step 1 is complete):

### Step 2 — Food Logging
```
Now add the food logging system to Sahha:
1. Photo capture component (browser file input with camera, resize to 1024px client-side)
2. /api/nutrition/recognize route that sends photo to Claude API and returns structured food JSON
3. FatSecret text search with autocomplete (/api/nutrition/search)
4. Barcode scanner using html5-qrcode library + FatSecret barcode lookup + Open Food Facts fallback
5. Edamam NLP parser for natural language input ("2 eggs and toast")
6. The Log screen UI with all 4 input methods (photo, barcode, voice, manual search)
7. Meal log CRUD — save to Supabase meal_logs table
8. Offline support with Dexie.js — queue logs when offline, sync when back online
9. Update the dashboard to show today's logged meals with real calorie totals
```

### Step 3 — Meal Plans
```
Add the meal planning system:
1. Spoonacular API integration for recipe search and meal plan generation
2. /api/meals/plan route that generates a weekly plan based on user's calorie target, diet preference, and allergies
3. Plan screen UI with day tabs (Mon-Sun), meals organized by type, macro breakdown per meal
4. Meal swap feature — tap "Swap" to get alternative meals with similar macros
5. Grocery list generator from the weekly plan
6. Save plans to Supabase meal_plans + meal_plan_items tables
```

### Step 4 — Push Notifications
```
Implement the full push notification system:
1. Generate VAPID keys and set up environment variables
2. Client-side push subscription flow (request permission, subscribe, save to Supabase)
3. Service worker push event handler with notification actions (Log Meal, Snooze 15min)
4. /api/cron/send-reminders route — checks user meal_times, sends push via web-push
5. Vercel cron config (hourly reminders, midnight streak update, weekly plan refresh)
6. Notification preferences UI in profile (toggle push, set meal times, email fallback toggle)
7. Evening check-in notification ("You're X calories short today")
8. Streak warning ("Don't break your 12-day streak!")
```

### Step 5 — Gamification
```
Build the gamification engine:
1. XP award system — hook into meal logging, target hitting, lesson completion
2. Level progression with the threshold formula, level-up detection
3. Streak tracking with multipliers (update daily via cron)
4. Achievement engine — check conditions on each action, unlock badges
5. Daily challenge system — generate daily challenges, track progress
6. Leaderboard using Supabase Realtime (friends + global)
7. Framer Motion animations: XP popup (+10 XP floating up), level-up modal with confetti, badge reveal
8. Streak fire animation on the dashboard
```

### Step 6 — Education & AI Coaching
```
Add the education hub and AI features:
1. "Why this food?" cards — on each logged meal, call Claude to explain the nutritional benefits
2. Micro-lessons library — seed the education_content table with 15+ lessons
3. Nutrition IQ quiz system with multiple choice questions and XP rewards
4. Myth Buster section with common nutrition myths
5. AI chatbot page — conversational nutrition coach powered by Claude API
6. Progress-unlocked content (advanced lessons unlock at higher levels)
```

### Step 7 — Polish & Launch
```
Final polish:
1. Lighthouse PWA audit — score above 95
2. Performance optimization (lazy loading, image compression, code splitting)
3. Stripe integration for premium tier ($9.99/mo)
4. Install banner component for PWA
5. Landing page at / for non-authenticated users
6. Analytics integration (PostHog or Mixpanel)
7. Error boundaries and loading states on every page
8. SEO meta tags and Open Graph images
9. Deploy to Vercel production
```
