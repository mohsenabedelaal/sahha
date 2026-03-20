"use client";

import { motion } from "framer-motion";

interface MacroMiniBarProps {
  label: string;
  current: number;
  target: number;
  color: string;
}

export function MacroMiniBar({ label, current, target, color }: MacroMiniBarProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  return (
    <div className="flex-1 bg-surface-2 rounded-[10px] p-2.5">
      <div className="flex justify-between text-[10px] text-tx2 mb-[5px]">
        <span>{label}</span>
        <span className="font-mono text-[10px]">{current}/{target}g</span>
      </div>
      <div className="h-[5px] rounded-[3px] bg-surface-3 overflow-hidden">
        <motion.div
          className="h-full rounded-[3px]"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
