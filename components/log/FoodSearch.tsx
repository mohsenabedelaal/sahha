"use client";

import { useState, useEffect, useRef } from "react";
import type { FoodSearchResult } from "@/lib/api/types";

interface FoodSearchProps {
  onSelect: (food: FoodSearchResult) => void;
}

export function FoodSearch({ onSelect }: FoodSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/nutrition/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.foods || []);
          setOpen(true);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timerRef.current);
  }, [query]);

  return (
    <div className="relative">
      <div className="flex items-center bg-surface border border-border rounded-xl px-3.5 py-3 gap-2.5 focus-within:border-mint focus-within:shadow-[0_0_0_3px_var(--mint-d)] transition-all">
        <span className="text-[16px]">{loading ? "⏳" : "🔍"}</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search food or type a meal..."
          className="flex-1 bg-transparent border-none outline-none text-foreground text-[14px] placeholder:text-tx3"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); setOpen(false); }}
            className="text-tx3 text-[14px]"
          >
            ✕
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-surface border border-border rounded-xl max-h-[300px] overflow-y-auto z-50 shadow-lg">
          {results.map((food) => (
            <button
              key={`${food.source}-${food.id}`}
              onClick={() => {
                onSelect(food);
                setQuery("");
                setResults([]);
                setOpen(false);
              }}
              className="w-full text-left px-3.5 py-2.5 flex items-center gap-3 border-b border-border last:border-0 active:bg-surface-2 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold truncate">{food.name}</p>
                {food.brand && (
                  <p className="text-[10px] text-tx3">{food.brand}</p>
                )}
                <p className="text-[10px] text-tx2 font-mono">
                  {food.nutrition.serving_size}
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[12px] font-bold text-mint">{Math.round(food.nutrition.calories)}</div>
                <div className="text-[9px] text-tx3">kcal</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
