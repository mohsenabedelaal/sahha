"use client";

import { useState, useEffect } from "react";

interface ChallengeData {
  id: number;
  title: string;
  description: string;
  xp_reward: number;
  progress: number;
  completed: boolean;
}

export function DailyChallenge() {
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);

  useEffect(() => {
    fetch("/api/gamification/challenge")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.challenge) setChallenge(data.challenge);
      })
      .catch(() => {});
  }, []);

  const title = challenge?.title || "Daily Challenge";
  const description = challenge?.description || "Log your meals to complete challenges!";
  const progress = challenge?.progress || 0;
  const xpReward = challenge?.xp_reward || 100;
  const completed = challenge?.completed || false;

  return (
    <div
      className="rounded-[14px] px-4 py-3.5 flex items-center gap-3"
      style={{
        background: completed
          ? "linear-gradient(135deg, rgba(52,211,153,0.1), rgba(52,211,153,0.05))"
          : "linear-gradient(135deg, rgba(52,211,153,0.05), rgba(56,189,248,0.05))",
        border: completed
          ? "1px solid rgba(52,211,153,0.2)"
          : "1px solid rgba(52,211,153,0.12)",
      }}
    >
      <span className="text-[26px]">{completed ? "✅" : "🎯"}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-bold">{title}</p>
        <p className="text-[11px] text-tx2 mt-[1px]">{description}</p>
        <div className="mt-1.5 h-[5px] rounded-[3px] bg-surface-3 overflow-hidden">
          <div
            className="h-full rounded-[3px]"
            style={{
              width: `${progress}%`,
              background: completed
                ? "var(--mint)"
                : "linear-gradient(90deg, var(--mint), var(--sky))",
            }}
          />
        </div>
      </div>
      <span className={`text-[12px] font-bold whitespace-nowrap ${completed ? "text-mint" : "text-amber"}`}>
        {completed ? "Done!" : `+${xpReward} XP`}
      </span>
    </div>
  );
}
