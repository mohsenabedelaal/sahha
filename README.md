<div align="center">

# صحة · Sahha

### The Gamified Nutrition PWA

*"Sahha" (صحة) means **health** in Arabic*

[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Claude AI](https://img.shields.io/badge/Claude_AI-D4A574?style=for-the-badge&logo=anthropic&logoColor=white)](https://anthropic.com)
[![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps)

**Track calories. Follow meal plans. Learn nutrition. Earn XP.**
Think *Duolingo* — but for your diet.

</div>

---

## What is Sahha?

Sahha is a **mobile-first Progressive Web App** that transforms nutrition tracking into an engaging, game-like experience. Users log meals through multiple methods (photo AI, barcode scan, voice description, or manual entry), follow personalized weekly meal plans, complete micro-lessons about nutrition, and earn XP, level up, and unlock badges for staying consistent.

No boring spreadsheets. No guilt trips. Just streak flames, level-up animations, and a smarter you.

---

## Screenshots

<div align="center">
<table>
  <tr>
    <td align="center"><b>Dashboard</b></td>
    <td align="center"><b>Log a Meal</b></td>
    <td align="center"><b>Meal Plan</b></td>
  </tr>
  <tr>
    <td><img src="https://i.imgur.com/placeholder1.png" width="200" alt="Dashboard"/></td>
    <td><img src="https://i.imgur.com/placeholder2.png" width="200" alt="Log Meal"/></td>
    <td><img src="https://i.imgur.com/placeholder3.png" width="200" alt="Meal Plan"/></td>
  </tr>
  <tr>
    <td align="center"><b>Learn</b></td>
    <td align="center"><b>Profile</b></td>
    <td></td>
  </tr>
  <tr>
    <td><img src="https://i.imgur.com/placeholder4.png" width="200" alt="Learn"/></td>
    <td><img src="https://i.imgur.com/placeholder5.png" width="200" alt="Profile"/></td>
    <td></td>
  </tr>
</table>
</div>

> **Dashboard** · Calorie ring with macros breakdown, daily streak, XP progress, daily challenges, and water tracking
> **Log a Meal** · 5 input methods: search, photo AI, barcode, voice description, manual
> **Meal Plan** · AI-generated weekly plan (Mon–Sun × 4 meal slots) with one-tap food swaps
> **Learn** · Nutrition IQ Quiz, AI Coach chat, and bite-sized micro-lessons
> **Profile** · Level progress, achievement badges, body stats, and gamification overview

---

## Core Features

### 🍽️ Smart Food Logging
| Method | How it works |
|--------|-------------|
| **Search** | Full-text search across FatSecret's 2.3M+ food database |
| **Photo** | Claude Vision identifies your meal from a photo |
| **Barcode** | Scan any packaged food — FatSecret instant lookup |
| **Describe** | Type "2 eggs and toast" → Claude parses it to structured nutrition data |
| **Manual** | Enter nutrition facts directly |

### 📅 Weekly Meal Planner
- Personalized 7-day plans with Breakfast, Lunch, Dinner, and Snack slots
- One-tap **food swap** to replace any meal while keeping calorie targets
- **Grocery list** auto-generated from your weekly plan
- Daily calorie + macro totals shown at a glance

### 🎮 Gamification Engine
- **XP System** — earn points for every healthy action
- **Streak Tracking** — daily streaks with multiplier bonuses at 3, 7, 14, and 30 days
- **Levels** — quadratic scaling; climb from *Nutrition Scout* to master
- **Achievements** — badge collection with unlock conditions (first log, 7-day streak, etc.)
- **Daily Challenges** — fresh challenge every day (+50–150 XP)

### 🧠 AI Nutrition Coach
- Powered by **Claude AI (Anthropic)**
- Chat interface for personalized nutrition advice
- Photo recognition with confidence scoring per ingredient
- NLP parsing of natural language meal descriptions

### 📚 Micro-Learning
- Short lessons: *"Why Protein Matters"*, *"Fiber: Your Gut's Best Friend"*, etc.
- Difficulty-tagged (beginner → advanced)
- **Nutrition IQ Quiz** with XP rewards for correct answers
- Track lesson completion and quiz history

### 💧 Water Tracking
- Log water intake by the glass
- Daily target with visual progress

### 📲 PWA Features
- **Installable** on iOS and Android from the browser
- **Offline support** via Dexie.js (IndexedDB) — meal logs cached locally
- **Push notifications** for meal reminders (web-push)
- Automatic background sync when back online

---

## Tech Stack

### Frontend
| Library | Purpose |
|---------|---------|
| **Next.js 16** (App Router) | Full-stack React framework |
| **TypeScript** | Type safety across the board |
| **Tailwind CSS v4** | Utility-first styling with CSS custom properties |
| **Zustand** | Lightweight client state (`userStore`, `mealStore`, `gameStore`) |
| **TanStack Query v5** | Server state, caching, background refetching |
| **Framer Motion** | XP animations, level-up celebrations |
| **Recharts** | Calorie ring and macro bar charts |

### PWA & Offline
| Library | Purpose |
|---------|---------|
| **Serwist** | Service worker (based on Workbox) |
| **Dexie.js** | IndexedDB abstraction for offline meal log caching |
| **html5-qrcode** | In-browser barcode scanning |
| **web-push** | Server-side push notification delivery |

### Backend & Database
| Library | Purpose |
|---------|---------|
| **Next.js API Routes** | REST endpoints under `/app/api/` |
| **SQLite** (better-sqlite3) | Local/server database — zero infrastructure |
| **Drizzle ORM** | Type-safe SQL queries and schema migrations |
| **NextAuth v5** | Credentials-based authentication |

### External APIs
| Service | Usage |
|---------|-------|
| **FatSecret Platform API** | Primary food database (2.3M+ foods) — search, barcode, autocomplete |
| **Anthropic Claude** | Photo food recognition + NLP meal description parsing |

---

## Project Structure

```
sahha/
├── app/
│   ├── (auth)/                 # login, signup, onboarding
│   ├── (main)/
│   │   ├── dashboard/          # calorie ring, macros, streak, XP bar
│   │   ├── log/                # food logging (5 input methods)
│   │   ├── plan/               # weekly meal planner Mon–Sun × 4 slots
│   │   ├── learn/              # lessons, quiz, AI coach chat
│   │   └── profile/            # stats, badges, body info
│   └── api/
│       ├── auth/               # NextAuth handler + signup
│       ├── nutrition/
│       │   ├── search/         # GET ?q=chicken  → FatSecret foods.search
│       │   ├── barcode/        # GET ?barcode=123 → FatSecret barcode lookup
│       │   ├── recognize/      # POST { imageBase64 } → Claude Vision
│       │   ├── parse/          # POST { text } → Claude NLP
│       │   └── explain/        # POST { food } → Claude explanation
│       ├── meals/
│       │   ├── log/            # CRUD for daily meal logs
│       │   ├── plan/           # CRUD for meal plan items
│       │   │   ├── swap/       # POST swap a meal plan item
│       │   │   └── grocery/    # GET auto-generated grocery list
│       │   └── sync/           # POST sync offline logs from IndexedDB
│       ├── gamification/
│       │   ├── xp/             # POST award XP
│       │   ├── stats/          # GET user gamification stats
│       │   ├── achievements/   # GET unlocked achievements
│       │   └── challenge/      # GET today's challenge + POST progress
│       ├── education/
│       │   ├── lessons/        # GET all lessons + mark complete
│       │   ├── quiz/           # GET questions + POST answers
│       │   └── chat/           # POST AI nutrition coach message
│       ├── water/              # GET/POST water logs
│       ├── notifications/      # subscribe / unsubscribe push
│       ├── onboarding/         # POST save profile + calculate targets
│       └── user/               # GET profile, PATCH preferences
├── components/
│   ├── ui/                     # Button, Card, Input, Modal
│   ├── dashboard/              # CalorieRing, MacroBar, StreakBanner
│   └── meals/                  # FoodSearch, PhotoCapture, BarcodeScanner, MealCard
├── lib/
│   ├── api/
│   │   ├── fatsecret.ts        # FatSecret OAuth2 client wrapper
│   │   └── claude.ts           # Anthropic SDK wrapper
│   ├── db/
│   │   ├── schema.ts           # All Drizzle table definitions
│   │   ├── index.ts            # DB connection singleton
│   │   └── seed*.ts            # Seed scripts for achievements/education
│   ├── gamification.ts         # XP rewards, level thresholds, streak multipliers
│   ├── gamification-engine.ts  # Achievement unlock logic
│   ├── calories.ts             # BMR / TDEE / macro target calculations
│   ├── auth.ts                 # NextAuth configuration
│   ├── offline-db.ts           # Dexie IndexedDB schema
│   └── push.ts                 # Web Push notification helpers
└── stores/
    ├── userStore.ts             # User profile + calorie targets
    ├── mealStore.ts             # Daily meals, calorie totals
    └── gameStore.ts             # XP, level, streak
```

---

## Database Schema

```
users               → profile, targets, XP, level, streak
food_items          → cached foods from FatSecret / Claude / manual entry
meal_logs           → daily logged meals per user
meal_plans          → named weekly plans per user
meal_plan_items     → foods assigned to each day + meal slot
achievements        → achievement definitions (conditions + XP rewards)
user_achievements   → unlocked achievements per user
daily_challenges    → daily challenge definitions
user_challenge_progress → per-user progress on today's challenge
education_content   → lessons and their content
quiz_questions      → questions linked to lessons
user_education_progress → completed lessons per user
user_quiz_results   → quiz answers and correctness history
chat_messages       → AI nutrition coach conversation history
water_logs          → water intake tracking
notification_subscriptions → web push endpoints
```

The `food_items.source` field tracks data origin: `'fatsecret' | 'claude' | 'manual'`.

---

## Gamification Details

### XP Rewards
| Action | XP |
|--------|----|
| Log a meal | +10 |
| Complete all meals for the day | +50 |
| Complete a daily challenge | +50 |
| Complete a lesson | +25 |
| Answer quiz correctly | +25 |
| Unlock an achievement | +100 |

### Streak Multipliers
| Streak | XP Multiplier |
|--------|--------------|
| 3+ days | 1.1× |
| 7+ days | 1.25× |
| 14+ days | 1.5× |
| 30+ days | 2.0× |

### Level Formula
```
XP required for level N = floor(100 × N^1.5)
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [FatSecret Platform](https://platform.fatsecret.com) API account (free)
- An [Anthropic](https://console.anthropic.com) API key

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/mohsenabedelaal/sahha.git
cd sahha

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.local.example .env.local
# → Fill in the values below

# 4. Create the SQLite database tables
npx drizzle-kit push

# 5. (Optional) Seed achievements and education content
npx tsx lib/db/seed-achievements.ts
npx tsx lib/db/seed-education.ts

# 6. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

```env
# Authentication
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000

# FatSecret Platform API
# Register at https://platform.fatsecret.com/api/Default.aspx?screen=r
FATSECRET_CLIENT_ID=your_client_id
FATSECRET_CLIENT_SECRET=your_client_secret

# Anthropic Claude API
# Get your key at https://console.anthropic.com
ANTHROPIC_API_KEY=sk-ant-...

# Web Push Notifications (generate with: npx web-push generate-vapid-keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:you@example.com
```

---

## API Reference

### Nutrition
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/nutrition/search?q=chicken` | GET | Search FatSecret food database |
| `/api/nutrition/barcode?barcode=012345` | GET | Look up packaged food by barcode |
| `/api/nutrition/recognize` | POST | Claude Vision photo → nutrition JSON |
| `/api/nutrition/parse` | POST | Claude NLP text → nutrition JSON |

### Meals
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/meals/log` | GET | Fetch today's meal logs |
| `/api/meals/log` | POST | Log a new meal |
| `/api/meals/log` | DELETE | Remove a logged meal |
| `/api/meals/plan` | GET/POST/DELETE | Manage weekly meal plan |
| `/api/meals/plan/swap` | POST | Swap a meal plan item |
| `/api/meals/plan/grocery` | GET | Generate grocery list |

### Gamification
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/gamification/stats` | GET | XP, level, streak, achievements |
| `/api/gamification/xp` | POST | Award XP for an action |
| `/api/gamification/achievements` | GET | User's unlocked achievements |
| `/api/gamification/challenge` | GET | Today's daily challenge |

### Education
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/education/lessons` | GET | All lessons + completion status |
| `/api/education/lessons/[id]` | POST | Mark lesson complete + award XP |
| `/api/education/quiz` | GET/POST | Fetch questions / submit answers |
| `/api/education/chat` | POST | Send message to AI nutrition coach |

---

## Design System

| Token | Value |
|-------|-------|
| Background | `#0d1117` |
| Surface | `#151b27` / `#1c2333` |
| Mint (primary) | `#34d399` |
| Amber (streak) | `#fbbf24` |
| Sky (carbs) | `#38bdf8` |
| Violet (fat) | `#a78bfa` |
| Font (sans) | Outfit |
| Font (numbers) | Space Mono |
| Primary viewport | 375–430px (mobile-first) |

---

## Deployment

Sahha is designed to deploy on **Vercel** with zero configuration:

```bash
npm run build
```

For production, set all environment variables in your hosting dashboard. The SQLite database file (`sahha.db`) is written to the filesystem, so use a persistent volume or consider migrating to [Turso](https://turso.tech) (SQLite over HTTP) for distributed deployments.

---

## License

MIT © Mohsen Abedelaal
