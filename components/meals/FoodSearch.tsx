"use client";

import { useState, useEffect, useRef } from "react";
import type { FoodItem } from "@/lib/api/fatsecret";

interface FoodSearchProps {
  onSelect: (food: FoodItem) => void;
  placeholder?: string;
}

export function FoodSearch({ onSelect, placeholder = "Search foods..." }: FoodSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/nutrition/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.foods ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(food: FoodItem) {
    onSelect(food);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl bg-surface-2 px-4 py-3 pr-10 text-foreground placeholder:text-muted/60 border border-transparent focus:border-mint focus:ring-2 focus:ring-mint/20 focus:outline-none transition-colors"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="animate-spin h-4 w-4 text-muted" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}
        {!loading && query && (
          <button
            onClick={() => { setQuery(""); setResults([]); setOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
          >
            ✕
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-xl bg-surface border border-surface-2 shadow-lg overflow-hidden max-h-72 overflow-y-auto">
          {results.map((food) => (
            <button
              key={food.fatsecret_id}
              onClick={() => handleSelect(food)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-2 transition-colors text-left"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{food.name}</p>
                {food.brand && (
                  <p className="text-xs text-muted truncate">{food.brand}</p>
                )}
                <p className="text-xs text-muted">
                  {food.serving_description ?? `${food.serving_size}${food.serving_unit}`}
                </p>
              </div>
              <div className="ml-4 text-right shrink-0">
                <p className="font-mono text-sm font-semibold text-mint">{Math.round(food.calories)} kcal</p>
                <p className="text-xs text-muted">
                  P {Math.round(food.protein_g)}g · C {Math.round(food.carbs_g)}g · F {Math.round(food.fat_g)}g
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && results.length === 0 && !loading && query.length >= 2 && (
        <div className="absolute z-50 mt-1 w-full rounded-xl bg-surface border border-surface-2 shadow-lg px-4 py-3 text-muted text-sm">
          No foods found for &quot;{query}&quot;
        </div>
      )}
    </div>
  );
}
