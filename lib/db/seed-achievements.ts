import { db } from "./index";
import { achievements } from "./schema";

const ACHIEVEMENTS = [
  { name: "First Log", icon: "🥗", description: "Log your first meal", xp_reward: 50, condition_type: "total_logs", condition_value: 1 },
  { name: "Getting Started", icon: "🌱", description: "Log 10 meals", xp_reward: 100, condition_type: "total_logs", condition_value: 10 },
  { name: "Dedicated Logger", icon: "📝", description: "Log 50 meals", xp_reward: 200, condition_type: "total_logs", condition_value: 50 },
  { name: "Nutrition Guru", icon: "🧘", description: "Log 200 meals", xp_reward: 500, condition_type: "total_logs", condition_value: 200 },
  { name: "3-Day Streak", icon: "🔥", description: "Maintain a 3-day logging streak", xp_reward: 75, condition_type: "streak_days", condition_value: 3 },
  { name: "7-Day Streak", icon: "🔥", description: "Maintain a 7-day logging streak", xp_reward: 150, condition_type: "streak_days", condition_value: 7 },
  { name: "14-Day Streak", icon: "💪", description: "Maintain a 14-day logging streak", xp_reward: 300, condition_type: "streak_days", condition_value: 14 },
  { name: "30-Day Streak", icon: "🏆", description: "Maintain a 30-day logging streak", xp_reward: 500, condition_type: "streak_days", condition_value: 30 },
  { name: "Level 5", icon: "⭐", description: "Reach Level 5", xp_reward: 100, condition_type: "level", condition_value: 5 },
  { name: "Level 10", icon: "🌟", description: "Reach Level 10", xp_reward: 200, condition_type: "level", condition_value: 10 },
  { name: "Level 25", icon: "👑", description: "Reach Level 25", xp_reward: 500, condition_type: "level", condition_value: 25 },
  { name: "Century Club", icon: "💯", description: "Log 100 meals", xp_reward: 300, condition_type: "total_logs", condition_value: 100 },
];

export async function seedAchievements() {
  for (const a of ACHIEVEMENTS) {
    await db.insert(achievements).values(a).onConflictDoNothing();
  }
  console.log(`Seeded ${ACHIEVEMENTS.length} achievements`);
}
