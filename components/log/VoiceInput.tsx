"use client";

import { useState } from "react";
import type { ParsedFood } from "@/lib/api/types";

interface VoiceInputProps {
  onResults: (foods: ParsedFood[]) => void;
}

export function VoiceInput({ onResults }: VoiceInputProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [error, setError] = useState("");

  async function handleParse() {
    if (!text.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/nutrition/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error("Parse failed");

      const data = await res.json();
      if (data.foods && data.foods.length > 0) {
        onResults(data.foods);
        setText("");
        setShowInput(false);
      } else {
        setError("Could not parse food. Try being more specific.");
      }
    } catch {
      setError("Failed to parse. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (showInput) {
    return (
      <div className="bg-surface border border-border rounded-[14px] p-3.5">
        <p className="text-[12px] font-bold mb-2">Describe your meal</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='e.g. "2 eggs, a slice of toast with butter, and orange juice"'
          className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-[13px] text-foreground placeholder:text-tx3 outline-none focus:border-mint resize-none"
          rows={3}
          autoFocus
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleParse}
            disabled={loading || !text.trim()}
            className="flex-1 py-2 rounded-lg bg-mint text-background text-[12px] font-bold disabled:opacity-50"
          >
            {loading ? "Parsing..." : "Parse Food"}
          </button>
          <button
            onClick={() => { setShowInput(false); setText(""); setError(""); }}
            className="py-2 px-4 rounded-lg bg-surface-2 text-tx2 text-[12px] font-semibold"
          >
            Cancel
          </button>
        </div>
        {error && <p className="text-[11px] text-coral mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowInput(true)}
      className="w-full bg-surface border border-border rounded-[14px] py-4 px-3 flex flex-col items-center gap-2 cursor-pointer transition-all active:border-violet/50 active:bg-surface-2 active:scale-[0.97]"
    >
      <div className="w-10 h-10 rounded-xl bg-violet-d flex items-center justify-center">
        <svg className="text-violet" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
        </svg>
      </div>
      <span className="text-[12px] font-bold">Describe</span>
      <span className="text-[9px] text-tx3 text-center leading-tight">&quot;Two eggs<br />and toast&quot;</span>
      <span className="text-[8px] font-bold font-mono py-[2px] px-1.5 rounded bg-violet-d text-violet">
        Claude AI
      </span>
    </button>
  );
}
