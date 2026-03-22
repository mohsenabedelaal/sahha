"use client";

import { motion } from "framer-motion";
import type { FoodSearchResult } from "@/lib/api/types";

interface BarcodeResultProps {
  food: FoodSearchResult;
  onLog: () => void;
  onScanAgain: () => void;
  onClose: () => void;
}

/** Simple Nutri-Score: 0–100 based on protein, calories, carbs, fat */
function calcScore(n: {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
}): number {
  let score = 60;

  // Protein is good
  if (n.protein_g >= 20) score += 20;
  else if (n.protein_g >= 10) score += 10;
  else if (n.protein_g >= 5) score += 5;

  // Fiber is good
  if ((n.fiber_g ?? 0) >= 5) score += 10;
  else if ((n.fiber_g ?? 0) >= 2) score += 5;

  // High calories per serving is bad
  if (n.calories > 500) score -= 25;
  else if (n.calories > 300) score -= 12;
  else if (n.calories < 100) score += 5;

  // High fat is bad
  if (n.fat_g > 25) score -= 15;
  else if (n.fat_g > 15) score -= 7;

  // High carbs relative to protein is bad
  if (n.carbs_g > 40 && n.protein_g < 5) score -= 15;
  else if (n.carbs_g > 25 && n.protein_g < 5) score -= 8;

  return Math.max(0, Math.min(100, score));
}

function scoreLabel(s: number): { label: string; color: string; bg: string; ring: string } {
  if (s >= 75) return { label: "Excellent", color: "#34d399", bg: "rgba(52,211,153,0.12)", ring: "#34d399" };
  if (s >= 50) return { label: "Good",      color: "#86efac", bg: "rgba(134,239,172,0.12)", ring: "#86efac" };
  if (s >= 25) return { label: "Fair",      color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  ring: "#fbbf24" };
  return               { label: "Poor",     color: "#fb7185", bg: "rgba(251,113,133,0.12)", ring: "#fb7185" };
}

const CIRCUMFERENCE = 2 * Math.PI * 44; // r=44

export function BarcodeResult({ food, onLog, onScanAgain, onClose }: BarcodeResultProps) {
  const score = calcScore(food.nutrition);
  const { label, color, bg, ring } = scoreLabel(score);
  const dashOffset = CIRCUMFERENCE * (1 - score / 100);

  const total = food.nutrition.protein_g + food.nutrition.carbs_g + food.nutrition.fat_g || 1;

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="fixed inset-0 z-[70] flex flex-col"
      style={{ background: "#0d1117" }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
        <span className="text-[11px] font-bold font-mono tracking-[2px] text-white/30 uppercase">
          Product Scanned
        </span>
        <div className="w-9" />
      </div>

      {/* Score circle */}
      <div className="flex flex-col items-center pt-4 pb-6">
        <div className="relative w-36 h-36 flex items-center justify-center">
          {/* Glow behind circle */}
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-30"
            style={{ background: ring }}
          />
          {/* SVG ring */}
          <svg width="144" height="144" viewBox="0 0 100 100" className="absolute">
            {/* Track */}
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
            {/* Progress */}
            <motion.circle
              cx="50" cy="50" r="44"
              fill="none"
              stroke={ring}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              transform="rotate(-90 50 50)"
            />
          </svg>
          {/* Score number */}
          <div className="relative text-center z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", damping: 15 }}
              className="text-[38px] font-black leading-none"
              style={{ color }}
            >
              {score}
            </motion.div>
            <div className="text-[10px] font-bold text-white/40 mt-0.5">/ 100</div>
          </div>
        </div>

        {/* Score label badge */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-3 px-4 py-1 rounded-full text-[11px] font-bold"
          style={{ background: bg, color, border: `1px solid ${ring}30` }}
        >
          {label}
        </motion.div>
      </div>

      {/* Product info */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="flex-1 overflow-y-auto px-5"
      >
        {/* Name + brand */}
        <div className="mb-5 text-center">
          <h2 className="text-[20px] font-extrabold tracking-[-0.4px] text-white leading-snug">
            {food.name}
          </h2>
          {food.brand && (
            <p className="text-[12px] text-white/40 mt-1">{food.brand}</p>
          )}
        </div>

        {/* Calorie hero */}
        <div
          className="rounded-2xl p-4 mb-4 flex items-center justify-between"
          style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.15)" }}
        >
          <div>
            <p className="text-[11px] font-bold text-white/40 uppercase tracking-wider mb-0.5">Calories</p>
            <p className="text-[13px] text-white/50">{food.nutrition.serving_size}</p>
          </div>
          <div className="text-right">
            <span className="text-[40px] font-black leading-none" style={{ color: "#34d399" }}>
              {Math.round(food.nutrition.calories)}
            </span>
            <span className="text-[13px] text-white/40 ml-1">kcal</span>
          </div>
        </div>

        {/* Macros */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <MacroCard label="Protein" value={food.nutrition.protein_g} unit="g" color="#38bdf8" bg="rgba(56,189,248,0.08)" pct={food.nutrition.protein_g / total} />
          <MacroCard label="Carbs"   value={food.nutrition.carbs_g}   unit="g" color="#fbbf24" bg="rgba(251,191,36,0.08)"  pct={food.nutrition.carbs_g / total} />
          <MacroCard label="Fat"     value={food.nutrition.fat_g}     unit="g" color="#a78bfa" bg="rgba(167,139,250,0.08)" pct={food.nutrition.fat_g / total} />
        </div>

        {/* Macro proportion bar */}
        <div className="flex h-2 rounded-full overflow-hidden mb-6 gap-px">
          <motion.div initial={{ flex: 0 }} animate={{ flex: food.nutrition.protein_g }} transition={{ delay: 0.6, duration: 0.8 }} style={{ background: "#38bdf8" }} />
          <motion.div initial={{ flex: 0 }} animate={{ flex: food.nutrition.carbs_g }}   transition={{ delay: 0.6, duration: 0.8 }} style={{ background: "#fbbf24" }} />
          <motion.div initial={{ flex: 0 }} animate={{ flex: food.nutrition.fat_g }}     transition={{ delay: 0.6, duration: 0.8 }} style={{ background: "#a78bfa" }} />
        </div>

        {/* Score explanation */}
        <div
          className="rounded-xl px-4 py-3 mb-6"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-[11px] text-white/40 leading-relaxed">
            Score based on protein content, calorie density, carb-to-protein ratio, fat and fiber. Higher protein and fiber with lower calories = better score.
          </p>
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="px-5 pb-10 pt-3 flex gap-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <button
          onClick={onScanAgain}
          className="flex-1 py-4 rounded-2xl text-[14px] font-semibold"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}
        >
          Scan Again
        </button>
        <button
          onClick={onLog}
          className="flex-[2] py-4 rounded-2xl text-[14px] font-bold text-black"
          style={{ background: "#34d399" }}
        >
          Log This Food
        </button>
      </motion.div>
    </motion.div>
  );
}

function MacroCard({ label, value, unit, color, bg, pct }: {
  label: string; value: number; unit: string; color: string; bg: string; pct: number;
}) {
  return (
    <div className="rounded-xl p-3 flex flex-col gap-2" style={{ background: bg, border: `1px solid ${color}20` }}>
      <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{label}</p>
      <p className="text-[20px] font-black leading-none" style={{ color }}>
        {Math.round(value)}<span className="text-[11px] font-semibold opacity-60 ml-0.5">{unit}</span>
      </p>
      {/* Mini bar */}
      <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, pct * 100)}%` }}
          transition={{ delay: 0.7, duration: 0.7 }}
          style={{ background: color }}
        />
      </div>
    </div>
  );
}
