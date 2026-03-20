"use client";

import { getStreakMultiplier } from "@/lib/gamification";

interface StreakBannerProps {
  streakDays: number;
  bestStreak: number;
}

export function StreakBanner({ streakDays, bestStreak }: StreakBannerProps) {
  const multiplier = getStreakMultiplier(streakDays);
  const nextMilestone = streakDays < 3 ? 3 : streakDays < 7 ? 7 : streakDays < 14 ? 14 : streakDays < 30 ? 30 : null;
  const daysToNext = nextMilestone ? nextMilestone - streakDays : 0;

  return (
    <div
      className="rounded-[14px] px-4 py-3 flex items-center gap-3"
      style={{
        background: "linear-gradient(135deg, #1a1200, #231900)",
        border: "1px solid rgba(251, 191, 36, 0.15)",
      }}
    >
      <span className="text-[30px] animate-pulse-fire">🔥</span>
      <div className="flex-1 min-w-0">
        <p className="text-[22px] font-extrabold text-amber">{streakDays} Day Streak</p>
        <p className="text-[11px] text-tx2">
          {nextMilestone
            ? `${daysToNext} more days for ${nextMilestone >= 30 ? "5" : nextMilestone >= 14 ? "2" : nextMilestone >= 7 ? "1.5" : "1.25"}× XP multiplier`
            : `Best: ${bestStreak} days`}
        </p>
      </div>
      {multiplier > 1 && (
        <div className="bg-amber-d text-amber text-[11px] font-bold py-[5px] px-[10px] rounded-full whitespace-nowrap">
          {multiplier}× XP
        </div>
      )}
    </div>
  );
}
