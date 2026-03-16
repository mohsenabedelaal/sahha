import { Card } from "@/components/ui/card";

interface StreakBannerProps {
  streakDays: number;
  bestStreak: number;
}

export function StreakBanner({ streakDays, bestStreak }: StreakBannerProps) {
  return (
    <Card className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🔥</span>
        <div>
          <p className="font-semibold text-foreground">{streakDays} day streak</p>
          <p className="text-sm text-muted">Best: {bestStreak} days</p>
        </div>
      </div>
    </Card>
  );
}
