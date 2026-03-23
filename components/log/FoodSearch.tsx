"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FoodSearchResult } from "@/lib/api/types";

const QUICK_CHIPS = [
  "Chicken breast", "Eggs", "Rice", "Banana",
  "Oatmeal", "Greek yogurt", "Avocado", "Bread",
];

interface FoodSearchProps {
  onSelect: (food: FoodSearchResult) => void;
}

export function FoodSearch({ onSelect }: FoodSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setSearched(false);
      setError(false);
      return;
    }

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      setSearched(false);
      setError(false);
      try {
        const res = await fetch(`/api/nutrition/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.foods || []);
          setSearched(true);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }, 380);

    return () => clearTimeout(timerRef.current);
  }, [query]);

  function handleSelect(food: FoodSearchResult) {
    onSelect(food);
    setQuery("");
    setResults([]);
    setSearched(false);
    setIsOpen(false);
  }

  function handleClose() {
    setQuery("");
    setResults([]);
    setSearched(false);
    setError(false);
    setIsOpen(false);
  }

  return (
    <>
      {/* Trigger bar */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center bg-surface border border-border rounded-xl px-4 py-3.5 gap-3 transition-all active:border-mint/50"
      >
        <svg className="text-tx3 shrink-0" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
        </svg>
        <span className="flex-1 text-[14px] text-tx3 text-left">Search food or ingredient...</span>
        <span className="text-[10px] font-mono text-tx3 bg-surface-2 border border-border px-1.5 py-0.5 rounded-md">
          Search
        </span>
      </button>

      {/* Full-screen overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 bg-background z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 pt-safe-top pt-4 pb-3 border-b border-border bg-background">
              <svg className="text-tx2 shrink-0" width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search food or ingredient..."
                className="flex-1 bg-transparent outline-none text-[15px] text-foreground placeholder:text-tx3"
              />
              {query ? (
                <button
                  onClick={() => { setQuery(""); setResults([]); setSearched(false); }}
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-surface-3 text-tx3 shrink-0"
                >
                  <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={handleClose}
                  className="text-[13px] font-semibold text-tx2 shrink-0 px-1"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain">

              {/* Quick chips — shown when no query */}
              {!query && (
                <div className="px-4 pt-5">
                  <p className="text-[10px] font-bold text-tx3 uppercase tracking-[1.2px] font-mono mb-3">
                    Popular searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        onClick={() => setQuery(chip)}
                        className="px-3 py-1.5 bg-surface-2 border border-border rounded-full text-[12px] font-medium text-tx2 active:border-mint active:text-mint transition-colors"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Skeleton loading */}
              {loading && (
                <div className="flex flex-col pt-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-surface-3 rounded-md w-3/4 animate-pulse" />
                        <div className="h-2.5 bg-surface-2 rounded-md w-2/5 animate-pulse" />
                        <div className="flex gap-1.5">
                          <div className="h-4 w-10 bg-surface-2 rounded-full animate-pulse" />
                          <div className="h-4 w-10 bg-surface-2 rounded-full animate-pulse" />
                          <div className="h-4 w-10 bg-surface-2 rounded-full animate-pulse" />
                        </div>
                      </div>
                      <div className="h-7 w-10 bg-surface-3 rounded-lg animate-pulse shrink-0" />
                    </div>
                  ))}
                </div>
              )}

              {/* Results */}
              {!loading && results.length > 0 && (
                <>
                  <p className="text-[10px] font-bold text-tx3 uppercase tracking-[1.2px] font-mono px-4 pt-4 pb-2">
                    {results.length} results
                  </p>
                  <div className="flex flex-col">
                    {results.map((food) => (
                      <button
                        key={`${food.source}-${food.id}`}
                        onClick={() => handleSelect(food)}
                        className="flex items-center gap-3 px-4 py-3.5 border-b border-border active:bg-surface-2 transition-colors text-left"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold leading-snug truncate">
                            {food.name}
                          </p>
                          <p className="text-[10px] text-tx3 mt-0.5 truncate">
                            {[food.brand, food.nutrition.serving_size].filter(Boolean).join(" · ")}
                          </p>
                          <div className="flex gap-1.5 mt-1.5">
                            <MacroPill label="P" value={food.nutrition.protein_g} color="var(--sky)" bg="var(--sky-d)" />
                            <MacroPill label="C" value={food.nutrition.carbs_g} color="var(--amber)" bg="var(--amber-d)" />
                            <MacroPill label="F" value={food.nutrition.fat_g} color="var(--violet)" bg="var(--violet-d)" />
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-[20px] font-black leading-none" style={{ color: "var(--mint)" }}>
                            {Math.round(food.nutrition.calories)}
                          </div>
                          <div className="text-[9px] text-tx3 mt-0.5">kcal</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-1.5 py-5">
                    <span className="text-[10px] text-tx3">Powered by</span>
                    <span className="text-[10px] font-bold text-tx2">Open Food Facts</span>
                  </div>
                </>
              )}

              {/* Empty state */}
              {!loading && searched && results.length === 0 && (
                <div className="flex flex-col items-center pt-16 px-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-surface-2 flex items-center justify-center mb-4">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-tx3" strokeWidth={1.5}>
                      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="text-[15px] font-bold mb-1.5">No results for &quot;{query}&quot;</p>
                  <p className="text-[12px] text-tx2 mb-6 leading-relaxed">
                    Try a different name, or add it manually with your own nutrition info.
                  </p>
                  <button
                    onClick={handleClose}
                    className="px-5 py-2.5 bg-mint text-background text-[13px] font-bold rounded-xl"
                  >
                    Use Manual Entry
                  </button>
                </div>
              )}

              {/* Error state */}
              {!loading && error && (
                <div className="flex flex-col items-center pt-16 px-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-coral-d flex items-center justify-center mb-4">
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-coral" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                  </div>
                  <p className="text-[15px] font-bold mb-1.5">Search unavailable</p>
                  <p className="text-[12px] text-tx2 mb-2 leading-relaxed">
                    Use photo, barcode scan, or voice instead.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MacroPill({
  label, value, color, bg,
}: {
  label: string; value: number; color: string; bg: string;
}) {
  return (
    <span
      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
      style={{ color, background: bg }}
    >
      {label} {Math.round(value)}g
    </span>
  );
}
