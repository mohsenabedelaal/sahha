"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { CalorieRing } from "@/components/dashboard/CalorieRing";
import { StreakBanner } from "@/components/dashboard/StreakBanner";
import { DailyChallenge } from "@/components/dashboard/DailyChallenge";
import { WaterTracker } from "@/components/dashboard/WaterTracker";
import { MealList } from "@/components/dashboard/MealList";
import { WhyCard } from "@/components/dashboard/WhyCard";
import { InstallBanner } from "@/components/InstallBanner";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/userStore";
import { useMealStore } from "@/stores/mealStore";
import { useGameStore } from "@/stores/gameStore";
import { xpForLevel } from "@/lib/gamification";
import { syncOfflineMeals } from "@/lib/sync";

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { profile, setProfile } = useUserStore();
  const { totals, loadTodaysMeals } = useMealStore();
  const { xp, level, streak_days, best_streak, setFromServer } = useGameStore();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const res = await fetch("/api/user");
      if (!res.ok) return;
      const user = await res.json();

      if (!user.onboarding_complete) {
        router.push("/onboarding");
        return;
      }

      setProfile({
        id: user.id,
        name: user.name,
        email: user.email,
        daily_calorie_target: user.daily_calorie_target,
        protein_target_g: user.protein_target_g,
        carbs_target_g: user.carbs_target_g,
        fat_target_g: user.fat_target_g,
        onboarding_complete: user.onboarding_complete,
      });

      setFromServer({
        xp: user.xp,
        level: user.level,
        streak_days: user.streak_days,
        best_streak: user.best_streak,
      });

      // Load today's meals and sync offline data
      await syncOfflineMeals();
      await loadTodaysMeals();

      setLoaded(true);
    }

    if (session?.user) loadUser();
  }, [session, router, setProfile, setFromServer, loadTodaysMeals]);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-muted">Loading...</div>
      </div>
    );
  }

  const greeting = getGreeting();
  const xpNext = xpForLevel(level + 1);
  const xpProgress = xpNext > 0 ? Math.min(Math.round((xp / xpNext) * 100), 100) : 0;

  return (
    <div className="flex flex-col gap-2.5 py-4">
      {/* Header */}
      <div className="px-4 pb-2">
        <p className="text-[13px] text-tx2">{greeting}</p>
        <p className="text-[26px] font-extrabold tracking-[-0.7px] leading-tight">
          {profile.name || "there"} 👋
        </p>
      </div>

      <InstallBanner />

      {/* Streak Banner */}
      <div className="px-4">
        <StreakBanner streakDays={streak_days} bestStreak={best_streak} />
      </div>

      {/* Calorie Ring + Macros */}
      <div className="px-4">
        <CalorieRing
          consumed={Math.round(totals.calories)}
          target={profile.daily_calorie_target || 2000}
          protein={{ current: Math.round(totals.protein_g), target: profile.protein_target_g || 155 }}
          carbs={{ current: Math.round(totals.carbs_g), target: profile.carbs_target_g || 248 }}
          fat={{ current: Math.round(totals.fat_g), target: profile.fat_target_g || 73 }}
        />
      </div>

      {/* Daily Challenge */}
      <div className="px-4">
        <DailyChallenge />
      </div>

      {/* Water Tracker */}
      <div className="px-4">
        <WaterTracker />
      </div>

      {/* Today's Meals */}
      <div className="px-4">
        <MealList />
      </div>

      {/* Why Card */}
      <div className="px-4">
        <WhyCard />
      </div>

      {/* XP / Level */}
      <div className="px-4 pb-4">
        <div className="rounded-[14px] bg-surface border border-border px-4 py-3.5">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-[13px] font-bold">
              Level <span className="text-mint">{level}</span> — Nutrition Scout
            </span>
            <span className="text-[11px] text-tx2 font-mono">{xp.toLocaleString()} / {xpNext.toLocaleString()} XP</span>
          </div>
          <div className="h-[7px] rounded-full bg-surface-3 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-[1500ms]"
              style={{
                width: `${xpProgress}%`,
                background: "linear-gradient(90deg, var(--mint), #06b6d4)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
