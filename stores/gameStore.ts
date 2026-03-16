import { create } from "zustand";
import { persist } from "zustand/middleware";
import { levelForXp, getStreakMultiplier } from "@/lib/gamification";

interface GameStore {
  xp: number;
  level: number;
  streak_days: number;
  best_streak: number;
  addXp: (amount: number) => void;
  setStreak: (days: number) => void;
  setFromServer: (data: { xp: number; level: number; streak_days: number; best_streak: number }) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      streak_days: 0,
      best_streak: 0,
      addXp: (amount) => {
        const multiplier = getStreakMultiplier(get().streak_days);
        const gained = Math.round(amount * multiplier);
        const newXp = get().xp + gained;
        set({ xp: newXp, level: levelForXp(newXp) });
      },
      setStreak: (days) => {
        const best = Math.max(days, get().best_streak);
        set({ streak_days: days, best_streak: best });
      },
      setFromServer: (data) => set(data),
    }),
    { name: "sahha-game" },
  ),
);
