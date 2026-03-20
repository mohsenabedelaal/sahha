"use client";

import { useState, useEffect } from "react";

interface WaterTrackerProps {
  target?: number;
}

export function WaterTracker({ target = 8 }: WaterTrackerProps) {
  const [glasses, setGlasses] = useState(0);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch("/api/water")
      .then((r) => r.ok ? r.json() : { glasses: 0 })
      .then((data) => setGlasses(data.glasses || 0))
      .catch(() => {});
  }, []);

  async function addWater() {
    setAdding(true);
    try {
      const res = await fetch("/api/water", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount_ml: 250 }),
      });
      if (res.ok) {
        const data = await res.json();
        setGlasses(data.glasses || glasses + 1);
      }
    } catch {
      // ignore
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="rounded-[14px] bg-surface border border-border px-4 py-3.5 flex items-center gap-3">
      <div className="flex gap-[3px]">
        {Array.from({ length: Math.min(target, 8) }).map((_, i) => (
          <div
            key={i}
            className={`w-[18px] h-[18px] rounded-full flex items-center justify-center text-[11px] ${
              i < glasses ? "bg-sky-d text-sky" : "bg-surface-2 text-tx3"
            }`}
          >
            {i < glasses ? "💧" : "○"}
          </div>
        ))}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-bold">Water: {glasses} of {target} glasses</p>
        <p className="text-[10px] text-tx2">Stay hydrated for better metabolism</p>
      </div>
      <button
        onClick={addWater}
        disabled={adding}
        className="py-1.5 px-3.5 rounded-lg bg-sky-d text-sky text-[11px] font-bold border border-[rgba(56,189,248,0.15)] hover:bg-[rgba(56,189,248,0.15)] transition-colors disabled:opacity-50"
      >
        {adding ? "..." : "+ Add"}
      </button>
    </div>
  );
}
