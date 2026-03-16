"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { CalorieRing } from "@/components/dashboard/CalorieRing";
import { MacroBar } from "@/components/dashboard/MacroBar";
import { StreakBanner } from "@/components/dashboard/StreakBanner";
import { InstallBanner } from "@/components/InstallBanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/userStore";
import { useMealStore } from "@/stores/mealStore";
import { useGameStore } from "@/stores/gameStore";
import { xpForLevel } from "@/lib/gamification";

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { profile, setProfile } = useUserStore();
  const { totals } = useMealStore();
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

      setLoaded(true);
    }

    if (session?.user) loadUser();
  }, [session, router, setProfile, setFromServer]);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-muted">Loading...</div>
      </div>
    );
  }

  const greeting = getGreeting();
  const xpNext = xpForLevel(level + 1);
  const xpProgress = xpNext > 0 ? Math.round((xp / xpNext) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">{greeting}, {profile.name || "there"}!</h1>
        <p className="text-muted text-sm">Track your nutrition journey</p>
      </div>

      <InstallBanner />

      {/* Calorie Ring */}
      <Card className="flex flex-col items-center py-6">
        <CalorieRing
          consumed={Math.round(totals.calories)}
          target={profile.daily_calorie_target || 2000}
        />
      </Card>

      {/* Macros */}
      <Card className="flex flex-col gap-3">
        <h2 className="font-semibold">Macros</h2>
        <MacroBar
          label="Protein"
          current={Math.round(totals.protein_g)}
          target={profile.protein_target_g || 150}
          color="var(--mint)"
        />
        <MacroBar
          label="Carbs"
          current={Math.round(totals.carbs_g)}
          target={profile.carbs_target_g || 200}
          color="var(--sky)"
        />
        <MacroBar
          label="Fat"
          current={Math.round(totals.fat_g)}
          target={profile.fat_target_g || 65}
          color="var(--amber)"
        />
      </Card>

      {/* Streak */}
      <StreakBanner streakDays={streak_days} bestStreak={best_streak} />

      {/* XP / Level */}
      <Card>
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold">Level {level}</span>
          <span className="text-sm text-muted font-mono">{xp}/{xpNext} XP</span>
        </div>
        <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
          <div
            className="h-full rounded-full bg-violet transition-all duration-500"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
      </Card>

      {/* Quick Action */}
      <Link href="/log">
        <Button className="w-full" size="lg">
          Log a Meal
        </Button>
      </Link>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
