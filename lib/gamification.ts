export const XP_REWARDS = {
  log_meal: 10,
  complete_day: 50,
  streak_bonus: 25,
  achievement: 100,
  challenge: 50,
  education: 25,
} as const;

export const STREAK_MULTIPLIERS: Record<number, number> = {
  3: 1.1,
  7: 1.25,
  14: 1.5,
  30: 2.0,
};

/** XP required to reach a given level (quadratic scaling) */
export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

/** Determine level from total XP */
export function levelForXp(xp: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) {
    level++;
  }
  return level;
}

/** Get streak multiplier based on current streak days */
export function getStreakMultiplier(streakDays: number): number {
  let multiplier = 1.0;
  for (const [threshold, mult] of Object.entries(STREAK_MULTIPLIERS)) {
    if (streakDays >= Number(threshold)) {
      multiplier = mult;
    }
  }
  return multiplier;
}
