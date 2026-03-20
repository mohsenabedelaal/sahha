"use client";

import { motion } from "framer-motion";
import { MacroMiniBar } from "./MacroMiniBar";

interface CalorieRingProps {
  consumed: number;
  target: number;
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fat: { current: number; target: number };
}

export function CalorieRing({ consumed, target, protein, carbs, fat }: CalorieRingProps) {
  const size = 170;
  const strokeWidth = 10;
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const percentage = target > 0 ? Math.min(consumed / target, 1.5) : 0;
  const offset = circumference - percentage * circumference;
  const remaining = Math.max(target - consumed, 0);

  const color =
    percentage > 1 ? "var(--red)" : percentage >= 0.8 ? "var(--amber)" : "var(--mint)";

  return (
    <div className="rounded-[14px] bg-surface border border-border p-5 text-center">
      <div className="relative w-[170px] h-[170px] mx-auto mb-3">
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={85}
            cy={85}
            r={radius}
            fill="none"
            stroke="var(--surface-3)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={85}
            cy={85}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.8, ease: [0.4, 0, 0.2, 1] }}
          />
        </svg>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="font-mono text-[34px] font-black tracking-[-1.5px]" style={{ color }}>
            {consumed.toLocaleString()}
          </div>
          <div className="text-[11px] text-tx2 -mt-0.5">of {target.toLocaleString()} kcal</div>
        </div>
      </div>
      <div className="text-[12px] text-tx2 mb-3.5">{remaining.toLocaleString()} remaining today</div>
      <div className="flex gap-2">
        <MacroMiniBar label="Protein" current={protein.current} target={protein.target} color="var(--sky)" />
        <MacroMiniBar label="Carbs" current={carbs.current} target={carbs.target} color="var(--amber)" />
        <MacroMiniBar label="Fat" current={fat.current} target={fat.target} color="var(--violet)" />
      </div>
    </div>
  );
}
