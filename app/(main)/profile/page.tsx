"use client";

import { useSession, signOut } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/userStore";
import { useGameStore } from "@/stores/gameStore";

export default function ProfilePage() {
  const { data: session } = useSession();
  const { profile, clearProfile } = useUserStore();
  const { level, xp } = useGameStore();

  async function handleLogout() {
    clearProfile();
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Card className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-mint text-2xl font-bold text-background">
            {(profile.name || session?.user?.email || "?")[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-lg">{profile.name || "User"}</p>
            <p className="text-sm text-muted">{session?.user?.email}</p>
          </div>
        </div>
      </Card>

      <Card className="flex flex-col gap-2">
        <h2 className="font-semibold mb-1">Stats</h2>
        <Row label="Level" value={String(level)} />
        <Row label="Total XP" value={String(xp)} />
        <Row label="Daily Target" value={`${profile.daily_calorie_target || "—"} cal`} />
        <Row label="Goal" value={formatGoal(profile.goal_type)} />
        <Row label="Activity" value={formatActivity(profile.activity_level)} />
      </Card>

      <Card className="flex flex-col gap-2">
        <h2 className="font-semibold mb-1">Macro Targets</h2>
        <Row label="Protein" value={`${profile.protein_target_g || "—"}g`} />
        <Row label="Carbs" value={`${profile.carbs_target_g || "—"}g`} />
        <Row label="Fat" value={`${profile.fat_target_g || "—"}g`} />
      </Card>

      <Button variant="danger" onClick={handleLogout} className="w-full">
        Sign Out
      </Button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

function formatGoal(goal: string | null) {
  if (!goal) return "—";
  return { cut: "Lose Weight", maintain: "Maintain", bulk: "Gain Weight" }[goal] || goal;
}

function formatActivity(level: string | null) {
  if (!level) return "—";
  return level.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
