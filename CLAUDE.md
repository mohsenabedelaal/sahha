# Sahha — Gamified Nutrition PWA

## What It Is
Sahha (صحة) is a mobile-first Progressive Web App where users track calories, follow personalized meal plans, learn about nutrition, and earn XP/levels/badges for staying consistent. Think "Duolingo for nutrition."

## Tech Stack

### Frontend
- **Next.js 15** (App Router, TypeScript) — `app/` directory
- **Tailwind CSS v4** — utility classes + CSS vars in `app/globals.css`
- **Zustand** — client state (`stores/userStore.ts`, `mealStore.ts`, `gameStore.ts`)
- **TanStack Query** — server state / data fetching
- **Framer Motion** — gamification animations
- **Recharts** — calorie/macro charts

### PWA
- **Serwist** — service worker (`app/sw.ts`)
- **Dexie.js** — IndexedDB offline meal log caching (`lib/offline-db.ts`)
- **html5-qrcode** — barcode scanning in `components/meals/BarcodeScanner.tsx`

### Backend & Database
- **SQLite** via **better-sqlite3** + **Drizzle ORM** (`lib/db/`)
- **NextAuth v5** — credentials-based auth (`lib/auth.ts`)

### Food & Nutrition APIs
- **FatSecret Platform API** — primary food database (2.3M+ foods). OAuth 2.0 client credentials. Text search, food detail, barcode lookup. Wrapper: `lib/api/fatsecret.ts`
- **Claude AI (Anthropic)** — photo recognition (multimodal) and NLP parsing ("2 eggs and toast" → nutrition JSON). Routes: `/api/nutrition/recognize`, `/api/nutrition/parse`

> No Edamam, Spoonacular, Open Food Facts, or USDA integrations — FatSecret + Claude only.

## Environment Variables

```env
# NextAuth
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000

# FatSecret (register at https://platform.fatsecret.com)
FATSECRET_CLIENT_ID=your_client_id
FATSECRET_CLIENT_SECRET=your_client_secret

# Anthropic (https://console.anthropic.com)
ANTHROPIC_API_KEY=your_anthropic_key
```

## How to Run

```bash
npm install
cp .env.local.example .env.local   # fill in secrets
npx drizzle-kit push                # create/update SQLite DB tables
npm run dev                         # starts on http://localhost:3000
```

## Project Structure

```
sahha/
├── app/
│   ├── (auth)/              # login, signup, onboarding pages
│   ├── (main)/              # dashboard, log, plan, learn, profile
│   │   ├── dashboard/       # calorie ring, macros, streak, XP bar
│   │   ├── log/             # food logging (search/barcode/photo/text tabs)
│   │   └── plan/            # weekly meal planner (Mon–Sun × 4 meal slots)
│   └── api/
│       ├── auth/            # NextAuth handler + signup
│       ├── nutrition/
│       │   ├── search/      # GET ?q=chicken  →  FatSecret foods.search
│       │   ├── barcode/     # GET ?barcode=123 → FatSecret food.find_id_for_barcode
│       │   ├── recognize/   # POST { imageBase64, mimeType } → Claude multimodal
│       │   └── parse/       # POST { text } → Claude NLP → nutrition JSON
│       ├── meals/
│       │   ├── log/         # GET today's logs | POST new log | DELETE log
│       │   └── plan/        # GET/POST/DELETE meal plan items
│       ├── onboarding/      # save onboarding data + calculate targets
│       └── user/            # get current user profile
├── components/
│   ├── ui/                  # Button, Card, Input, Modal
│   ├── dashboard/           # CalorieRing, MacroBar, StreakBanner
│   └── meals/               # FoodSearch, PhotoCapture, BarcodeScanner, MealCard
├── lib/
│   ├── api/
│   │   └── fatsecret.ts     # FatSecret OAuth2 wrapper
│   ├── db/
│   │   ├── index.ts         # Drizzle + better-sqlite3
│   │   ├── schema.ts        # all table definitions
│   │   └── types.ts         # inferred TS types
│   ├── auth.ts              # NextAuth config
│   ├── calories.ts          # BMR/TDEE/macro calculations
│   ├── gamification.ts      # XP rules, level thresholds
│   └── offline-db.ts        # Dexie IndexedDB for offline caching
├── stores/
│   ├── userStore.ts         # user profile + targets
│   ├── mealStore.ts         # daily meals, calorie totals
│   └── gameStore.ts         # XP, level, streak
└── drizzle.config.ts
```

## Database Schema (SQLite)

Key tables:

| Table | Purpose |
|-------|---------|
| `users` | Profile, targets, XP, level, streak |
| `food_items` | Cached food data from FatSecret/Claude/manual |
| `meal_logs` | User's logged meals (references food_items) |
| `meal_plans` | Named meal plans per user |
| `meal_plan_items` | Foods assigned to each day/meal slot in a plan |
| `achievements` | Achievement definitions |
| `user_achievements` | Unlocked achievements per user |
| `daily_challenges` | Daily challenge definitions |
| `education_content` | Lessons, tips, quizzes |
| `notification_subscriptions` | Push notification endpoints |
| `water_logs` | Water intake tracking |

The `food_items.source` field tracks where data came from: `'fatsecret' | 'claude' | 'manual'`.

## FatSecret API

**Token endpoint:** `POST https://oauth.fatsecret.com/connect/token`
- Auth: `Basic base64(CLIENT_ID:CLIENT_SECRET)`
- Body: `grant_type=client_credentials&scope=basic`

**API base:** `https://platform.fatsecret.com/rest/server.api?format=json`
- `method=foods.search&search_expression=...&page_number=...&max_results=20`
- `method=food.get&food_id=...`
- `method=food.find_id_for_barcode&barcode=...`
- `method=foods.autocomplete&expression=...&max_results=5`

Tokens are cached in memory (expires_in ~86400s). See `lib/api/fatsecret.ts`.

## Claude AI Integration

**Photo recognition:** Send base64 image + system prompt → returns structured JSON:
```json
{ "foods": [{ "name", "estimated_grams", "confidence", "calories", "protein_g", "carbs_g", "fat_g", "fiber_g" }], "meal_type_guess", "total_calories" }
```

**NLP parsing:** Send natural language text → same JSON schema as photo recognition.

## Design System

- Dark theme: background `#0d1117`, surfaces `#151b27` / `#1c2333`
- Accent colors: mint `#34d399`, amber `#fbbf24`, sky `#38bdf8`, violet `#a78bfa`
- Fonts: Outfit (sans), Space Mono (mono/numbers)
- Mobile-first: 375–430px primary

## Gamification

- **XP rewards:** LOG_MEAL=10, LOG_ALL_MEALS=50, HIT_CALORIE_TARGET=30, COMPLETE_LESSON=100
- **Streaks:** tracked per user, multipliers at 3/7/14/30/60 days
- **Achievements:** unlocked by condition types (streak count, meals logged, etc.)
- **Levels:** formula `xpForLevel(n) = n * 150 + (n-1) * 50`
