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
        className="w-full bg-surface border border-border rounded-[14px] py-4 px-3 flex flex-col items-center gap-1.5 cursor-pointer transition-all active:border-mint active:bg-surface-2 active:scale-[0.97] disabled:opacity-50"
      >
        <span className="text-[26px]">{loading ? "⏳" : "📸"}</span>
        <span className="text-[12px] font-bold">{loading ? "Analyzing..." : "Take Photo"}</span>
        <span className="text-[10px] text-tx2 text-center">AI identifies your food</span>
        <span className="text-[8px] font-bold font-mono py-[2px] px-1.5 rounded mt-0.5 bg-sky-d text-sky">
          Claude Vision
        </span>
      </button>
      {error && <p className="text-[11px] text-coral mt-1 text-center">{error}</p>}
    </div>
  );
}
