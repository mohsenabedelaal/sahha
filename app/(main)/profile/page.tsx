"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useUserStore } from "@/stores/userStore";
import { useGameStore } from "@/stores/gameStore";
import { xpForLevel } from "@/lib/gamification";

interface Achievement {
  id: number;
  name: string;
  icon: string | null;
  description: string;
  xp_reward: number;
  earned: boolean;
}

const BADGE_COLORS: Record<number, { bg: string; border: string }> = {};
const DEFAULT_COLORS = [
  { bg: "var(--amber-d)", border: "var(--amber)" },
  { bg: "var(--mint-d)", border: "var(--mint)" },
  { bg: "var(--sky-d)", border: "var(--sky)" },
  { bg: "var(--violet-d)", border: "var(--violet)" },
];

export default function ProfilePage() {
  const { data: session } = useSession();
  const { profile, clearProfile } = useUserStore();
  const { level, xp, streak_days } = useGameStore();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState({ total_logs: 0, badges_earned: 0 });

  useEffect(() => {
    fetch("/api/gamification/achievements")
      .then((r) => r.ok ? r.json() : { achievements: [] })
      .then((data) => setAchievements(data.achievements || []))
      .catch(() => {});

    fetch("/api/gamification/stats")
      .then((r) => r.ok ? r.json() : { total_logs: 0, badges_earned: 0 })
      .then((data: { total_logs?: number; badges_earned?: number }) => setStats({ total_logs: data.total_logs || 0, badges_earned: data.badges_earned || 0 }))
      .catch(() => {});
  }, []);

  const xpNext = xpForLevel(level + 1);
  const xpProgress = xpNext > 0 ? Math.min(Math.round((xp / xpNext) * 100), 100) : 0;

  async function handleLogout() {
    clearProfile();
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <div className="flex flex-col gap-3.5 py-4 px-4">
      {/* Header */}
      <div className="flex items-center gap-3.5 mb-2">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-[26px] border-[3px] border-surface"
          style={{
            background: "linear-gradient(135deg, var(--mint), var(--sky))",
            boxShadow: "0 0 0 2px var(--mint)",
          }}
        >
          🧑‍🚀
        </div>
        <div>
          <p className="text-[19px] font-extrabold">{profile.name || "User"}</p>
          <p className="text-[12px] text-mint font-semibold">
            Level {level} — Nutrition Scout
          </p>
          <p className="text-[10px] text-tx3">
            {session?.user?.email || ""}
          </p>
        </div>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-3 gap-[7px]">
        <StatCard value={String(streak_days)} label="Day Streak" color="var(--amber)" />
        <StatCard value={xp.toLocaleString()} label="Total XP" color="var(--mint)" />
        <StatCard value={String(stats.badges_earned)} label="Badges" color="var(--sky)" />
      </div>

      {/* XP Progress */}
      <div className="rounded-[14px] bg-surface border border-border px-4 py-3.5">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-[13px] font-bold">
            Level <span className="text-mint">{level}</span> → {level + 1}
          </span>
          <span className="text-[11px] text-tx2 font-mono">
            {xp.toLocaleString()} / {xpNext.toLocaleString()}
          </span>
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

      {/* Achievements */}
      <SectionLabel>Achievements</SectionLabel>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {(achievements.length > 0 ? achievements : []).map((badge, i) => {
          const colors = BADGE_COLORS[badge.id] || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
          return (
            <div key={badge.id} className="flex-none w-[68px] text-center">
              <div
                className={`w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-[22px] mx-auto mb-1 border-2 ${
                  badge.earned ? "" : "opacity-30 grayscale"
                }`}
                style={{
                  background: badge.earned ? colors.bg : "var(--surface-2)",
                  borderColor: badge.earned ? colors.border : "var(--border)",
                  boxShadow: badge.earned ? `0 0 10px ${colors.bg}` : undefined,
                }}
              >
                {badge.icon || "🏅"}
              </div>
              <span className="text-[9px] text-tx2 font-semibold">{badge.name}</span>
            </div>
          );
        })}
        {achievements.length === 0 && (
          <p className="text-[11px] text-tx3 py-4 w-full text-center">
            Earn badges by logging meals and maintaining streaks!
          </p>
        )}
      </div>

      {/* Body Stats */}
      <SectionLabel>Body Stats</SectionLabel>
      <SettingRow label="Height" value={profile.height_cm ? `${profile.height_cm} cm` : "—"} />
      <SettingRow label="Weight" value={profile.weight_kg ? `${profile.weight_kg} kg` : "—"} />
      <SettingRow label="Goal" value={formatGoal(profile.goal_type)} valueColor="var(--mint)" />
      <SettingRow label="Diet" value={profile.diet_preference || "Standard"} />

      {/* Notifications */}
      <SectionLabel>Notifications</SectionLabel>
      <SettingRow label="Push Notifications" toggle="on" />
      <SettingRow label="Breakfast" value="8:00 AM" />
      <SettingRow label="Lunch" value="12:30 PM" />
      <SettingRow label="Dinner" value="7:00 PM" />
      <SettingRow label="Evening Check-in" toggle="on" />
      <SettingRow label="Email Fallback (iOS)" toggle="off" />

      {/* Account */}
      <SectionLabel>Account</SectionLabel>
      <SettingRow label="Upgrade to Premium" value="Coming Soon" valueColor="var(--amber)" />
      <SettingRow label="Total Meals Logged" value={String(stats.total_logs)} />
      <button
        onClick={handleLogout}
        className="flex justify-between items-center px-3.5 py-3 bg-surface border border-border rounded-[10px] text-[13px] cursor-pointer active:border-mint w-full text-left"
      >
        <span className="text-coral">Log Out</span>
      </button>

      <p className="text-center text-[9px] text-tx3 mt-2 pb-2">
        Sahha v1.0 · PWA
      </p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-bold text-tx3 uppercase tracking-[1.2px] font-mono mt-2 mb-0.5">
      {children}
    </div>
  );
}

function StatCard({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="bg-surface border border-border rounded-[10px] py-3 px-2.5 text-center">
      <div className="text-[20px] font-extrabold" style={{ color }}>{value}</div>
      <div className="text-[10px] text-tx2 mt-[1px]">{label}</div>
    </div>
  );
}

function SettingRow({
  label,
  value,
  valueColor,
  toggle,
}: {
  label: string;
  value?: string;
  valueColor?: string;
  toggle?: "on" | "off";
}) {
  return (
    <div className="flex justify-between items-center px-3.5 py-3 bg-surface border border-border rounded-[10px] text-[13px] cursor-pointer active:border-mint">
      <span>{label}</span>
      {toggle ? (
        <div
          className={`w-10 h-6 rounded-full relative ${toggle === "on" ? "bg-mint" : "bg-surface-3"}`}
        >
          <div
            className={`w-[18px] h-[18px] rounded-full bg-white absolute top-[3px] transition-all ${
              toggle === "on" ? "left-[19px]" : "left-[3px]"
            }`}
          />
        </div>
      ) : (
        <span className="text-[12px] text-tx2" style={valueColor ? { color: valueColor } : undefined}>
          {value}
        </span>
      )}
    </div>
  );
}

function formatGoal(goal: string | null) {
  if (!goal) return "—";
  return (
    { cut: "Cut (−500 kcal)", maintain: "Maintain", bulk: "Bulk (+300 kcal)" }[goal] || goal
  );
}
