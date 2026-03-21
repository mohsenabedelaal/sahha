"use client";

import { useRef, useState } from "react";
import type { FoodRecognitionResult } from "@/lib/api/types";

interface PhotoCaptureProps {
  onResults: (foods: FoodRecognitionResult[]) => void;
}

function resizeImage(file: File, maxSize = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;
        if (w > maxSize || h > maxSize) {
          if (w > h) { h = (h / w) * maxSize; w = maxSize; }
          else { w = (w / h) * maxSize; h = maxSize; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        // Strip the data:image/jpeg;base64, prefix
        resolve(dataUrl.split(",")[1]);
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function PhotoCapture({ onResults }: PhotoCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");

    try {
      const base64 = await resizeImage(file);
      const res = await fetch("/api/nutrition/recognize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mediaType: "image/jpeg" }),
      });

      if (!res.ok) throw new Error("Recognition failed");

      const data = await res.json();
      if (data.foods && data.foods.length > 0) {
        onResults(data.foods);
      } else {
        setError("No food detected. Try a clearer photo.");
      }
    } catch {
      setError("Failed to recognize food. Please try again.");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCapture}
        className="hidden"
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="w-full bg-surface border border-border rounded-[14px] py-4 px-3 flex flex-col items-center gap-2 cursor-pointer transition-all active:border-sky/50 active:bg-surface-2 active:scale-[0.97] disabled:opacity-50 relative overflow-hidden"
      >
        <div className="w-10 h-10 rounded-xl bg-sky-d flex items-center justify-center">
          {loading ? (
            <svg className="animate-spin text-sky" width="18" height="18" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
            </svg>
          ) : (
            <svg className="text-sky" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
            </svg>
          )}
        </div>
        <span className="text-[12px] font-bold">{loading ? "Analyzing..." : "Photo"}</span>
        <span className="text-[9px] text-tx3 text-center leading-tight">AI identifies<br />your food</span>
        <span className="text-[8px] font-bold font-mono py-[2px] px-1.5 rounded bg-sky-d text-sky">
          Claude Vision
        </span>
      </button>
      {error && <p className="text-[11px] text-coral mt-1 text-center">{error}</p>}
    </div>
  );
}
