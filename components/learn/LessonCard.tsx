"use client";

interface LessonCardProps {
  id: number;
  title: string;
  category: string;
  difficulty_level: string;
  xp_reward: number;
  completed: boolean;
  locked: boolean;
  requiredLevel: number;
  onSelect: (id: number) => void;
}

const CATEGORY_EMOJI: Record<string, string> = {
  macronutrients: "🥚",
  micronutrients: "🥦",
  basics: "💧",
  advanced: "🧪",
};

export function LessonCard({
  id, title, category, difficulty_level, xp_reward,
  completed, locked, requiredLevel, onSelect,
}: LessonCardProps) {
  const emoji = CATEGORY_EMOJI[category] || "📖";

  return (
    <button
      onClick={() => !locked && onSelect(id)}
      disabled={locked}
      className={`w-full text-left bg-surface border border-border rounded-[14px] p-3.5 relative overflow-hidden transition-colors active:border-sky ${
        locked ? "opacity-45 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <div
        className={`absolute top-2.5 right-2.5 text-[9px] font-bold py-[3px] px-[7px] rounded-[5px] ${
          completed ? "bg-mint-d text-mint" :
          locked ? "bg-surface-3 text-tx3" :
          "bg-sky-d text-sky"
        }`}
      >
        {completed ? "Completed ✓" : locked ? `🔒 Lvl ${requiredLevel}` : difficulty_level}
      </div>
      <div className="text-[26px] mb-1.5">{emoji}</div>
      <p className="text-[14px] font-bold mb-[3px]">{title}</p>
      <div className={`flex items-center gap-1 mt-1.5 text-[11px] font-bold ${
        locked ? "text-tx3" : completed ? "text-mint" : "text-amber"
      }`}>
        {completed ? `⭐ ${xp_reward} XP earned` : locked ? `🔒 +${xp_reward} XP` : `⭐ +${xp_reward} XP`}
      </div>
    </button>
  );
}
