import { db } from "./db";
import {
  users,
  userAchievements,
  achievements,
  dailyChallenges,
  userChallengeProgress,
  mealLogs,
} from "./db/schema";
import { eq, and, gte, lt, sql, count } from "drizzle-orm";
import {
  XP_REWARDS,
  getStreakMultiplier,
  levelForXp,
} from "./gamification";

type XpAction = keyof typeof XP_REWARDS;

interface XpResult {
  xpGained: number;
  newXp: number;
  newLevel: number;
  previousLevel: number;
  leveledUp: boolean;
}

export async function awardXp(userId: number, action: XpAction): Promise<XpResult> {
  const [user] = await db
    .select({ xp: users.xp, level: users.level, streak_days: users.streak_days })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) throw new Error("User not found");

  const baseXp = XP_REWARDS[action];
  const multiplier = getStreakMultiplier(user.streak_days);
  const xpGained = Math.round(baseXp * multiplier);
  const newXp = user.xp + xpGained;
  const previousLevel = user.level;
  const newLevel = levelForXp(newXp);

  await db
    .update(users)
    .set({ xp: newXp, level: newLevel })
    .where(eq(users.id, userId));

  return {
    xpGained,
    newXp,
    newLevel,
    previousLevel,
    leveledUp: newLevel > previousLevel,
  };
}

interface AchievementCheck {
  id: number;
  name: string;
  icon: string | null;
  xp_reward: number;
}

export async function checkAchievements(
  userId: number,
  action: XpAction
): Promise<AchievementCheck[]> {
  const earned: AchievementCheck[] = [];

  // Get all achievements user hasn't earned yet
  const allAchievements = await db.select().from(achievements);
  const userEarned = await db
    .select({ achievement_id: userAchievements.achievement_id })
    .from(userAchievements)
    .where(eq(userAchievements.user_id, userId));

  const earnedIds = new Set(userEarned.map((a) => a.achievement_id));
  const unearnedAchievements = allAchievements.filter((a) => !earnedIds.has(a.id));

  for (const achievement of unearnedAchievements) {
    const met = await checkCondition(userId, achievement.condition_type, achievement.condition_value, action);
    if (met) {
      await db.insert(userAchievements).values({
        user_id: userId,
        achievement_id: achievement.id,
      });

      // Award achievement XP
      await awardXp(userId, "achievement");

      earned.push({
        id: achievement.id,
        name: achievement.name,
        icon: achievement.icon,
        xp_reward: achievement.xp_reward,
      });
    }
  }

  return earned;
}

async function checkCondition(
  userId: number,
  conditionType: string,
  conditionValue: number,
  _action: XpAction
): Promise<boolean> {
  switch (conditionType) {
    case "total_logs": {
      const [result] = await db
        .select({ cnt: count() })
        .from(mealLogs)
        .where(eq(mealLogs.user_id, userId));
      return (result?.cnt || 0) >= conditionValue;
    }
    case "streak_days": {
      const [user] = await db
        .select({ streak_days: users.streak_days })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      return (user?.streak_days || 0) >= conditionValue;
    }
    case "level": {
      const [user] = await db
        .select({ level: users.level })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      return (user?.level || 1) >= conditionValue;
    }
    default:
      return false;
  }
}

export async function updateStreak(userId: number): Promise<number> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const [result] = await db
    .select({ cnt: count() })
    .from(mealLogs)
    .where(
      and(
        eq(mealLogs.user_id, userId),
        gte(mealLogs.logged_at, `${yesterdayStr} 00:00:00`),
        lt(mealLogs.logged_at, `${yesterdayStr}T23:59:59`)
      )
    );

  const [user] = await db
    .select({ streak_days: users.streak_days, best_streak: users.best_streak })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return 0;

  let newStreak: number;
  if ((result?.cnt || 0) > 0) {
    newStreak = user.streak_days + 1;
  } else {
    newStreak = 0;
  }

  const newBest = Math.max(newStreak, user.best_streak);

  await db
    .update(users)
    .set({ streak_days: newStreak, best_streak: newBest })
    .where(eq(users.id, userId));

  if (newStreak > 0) {
    await awardXp(userId, "streak_bonus");
  }

  return newStreak;
}

export async function getDailyChallenge(userId: number) {
  const today = new Date().toISOString().split("T")[0];

  // Check if there's an existing challenge for today
  const [existing] = await db
    .select({
      id: dailyChallenges.id,
      title: dailyChallenges.title,
      description: dailyChallenges.description,
      xp_reward: dailyChallenges.xp_reward,
      challenge_type: dailyChallenges.challenge_type,
      target_value: dailyChallenges.target_value,
      current_value: userChallengeProgress.current_value,
      completed: userChallengeProgress.completed,
    })
    .from(dailyChallenges)
    .leftJoin(
      userChallengeProgress,
      and(
        eq(userChallengeProgress.challenge_id, dailyChallenges.id),
        eq(userChallengeProgress.user_id, userId)
      )
    )
    .where(eq(dailyChallenges.date, today))
    .limit(1);

  if (existing) {
    return {
      ...existing,
      current_value: existing.current_value || 0,
      completed: existing.completed || false,
      progress: existing.target_value > 0
        ? Math.min(Math.round(((existing.current_value || 0) / existing.target_value) * 100), 100)
        : 0,
    };
  }

  // Create a challenge for today from templates
  const templates = [
    { title: "Log All Meals", description: "Log breakfast, lunch, and dinner today", type: "log_count", target: 3, xp: 100 },
    { title: "Protein Power", description: "Hit your protein target today", type: "protein_target", target: 100, xp: 150 },
    { title: "Hydration Hero", description: "Drink 8 glasses of water", type: "water_glasses", target: 8, xp: 100 },
    { title: "Fiber Focus", description: "Eat 25g of fiber today", type: "fiber_target", target: 25, xp: 150 },
    { title: "Balanced Day", description: "Stay within 100 kcal of your target", type: "calorie_balance", target: 100, xp: 200 },
  ];

  const template = templates[Math.floor(Math.random() * templates.length)];

  const [challenge] = await db
    .insert(dailyChallenges)
    .values({
      title: template.title,
      description: template.description,
      xp_reward: template.xp,
      challenge_type: template.type,
      target_value: template.target,
      date: today,
    })
    .returning();

  await db.insert(userChallengeProgress).values({
    user_id: userId,
    challenge_id: challenge.id,
    current_value: 0,
    completed: false,
    date: today,
  });

  return {
    ...challenge,
    current_value: 0,
    completed: false,
    progress: 0,
  };
}

export async function updateChallengeProgress(
  userId: number,
  challengeId: number,
  incrementBy: number
) {
  const [progress] = await db
    .select()
    .from(userChallengeProgress)
    .where(
      and(
        eq(userChallengeProgress.user_id, userId),
        eq(userChallengeProgress.challenge_id, challengeId)
      )
    )
    .limit(1);

  if (!progress || progress.completed) return progress;

  const [challenge] = await db
    .select({ target_value: dailyChallenges.target_value, xp_reward: dailyChallenges.xp_reward })
    .from(dailyChallenges)
    .where(eq(dailyChallenges.id, challengeId))
    .limit(1);

  if (!challenge) return null;

  const newValue = progress.current_value + incrementBy;
  const completed = newValue >= challenge.target_value;

  await db
    .update(userChallengeProgress)
    .set({
      current_value: newValue,
      completed,
    })
    .where(eq(userChallengeProgress.id, progress.id));

  if (completed) {
    await awardXp(userId, "challenge");
  }

  return { current_value: newValue, completed };
}
