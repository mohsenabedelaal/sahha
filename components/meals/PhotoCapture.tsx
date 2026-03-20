"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface RecognizedFood {
  name: string;
  estimated_grams: number;
  confidence: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
}

interface RecognitionResult {
  foods: RecognizedFood[];
  meal_type_guess: string;
  total_calories: number;
}

interface PhotoCaptureProps {
  onFoodsRecognized: (foods: RecognizedFood[], mealTypeGuess: string) => void;
}

const MAX_DIMENSION = 1024;

function resizeImage(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      let { width, height } = img;

      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height / width) * MAX_DIMENSION);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width / height) * MAX_DIMENSION);
          height = MAX_DIMENSION;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));

      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      const base64 = dataUrl.split(",")[1];
      resolve({ base64, mimeType: "image/jpeg" });
    };

    img.onerror = reject;
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function PhotoCapture({ onFoodsRecognized }: PhotoCaptureProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setResult(null);

    // Show preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    setLoading(true);
    try {
      const { base64, mimeType } = await resizeImage(file);

      const res = await fetch("/api/nutrition/recognize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });

      if (!res.ok) throw new Error("Recognition failed");

      const data: RecognitionResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Recognition failed");
    } finally {
      setLoading(false);
    }
  }

  function handleConfirm() {
    if (!result) return;
    onFoodsRecognized(result.foods, result.meal_type_guess);
    setPreview(null);
    setResult(null);
  }

  function handleReset() {
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-4">
      {!preview && (
        <label className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-surface-2 p-8 cursor-pointer hover:border-mint/50 transition-colors">
          <span className="text-4xl">📷</span>
          <div className="text-center">
            <p className="font-medium">Take or upload a food photo</p>
            <p className="text-sm text-muted">Claude AI will identify the foods</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>
      )}

      {preview && (
        <div className="flex flex-col gap-3">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-surface-2">
            <Image src={preview} alt="Food preview" fill className="object-cover" />
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-muted text-sm">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing with Claude AI...
            </div>
          )}

          {error && (
            <p className="text-sm text-red">{error}</p>
          )}

          {result && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-muted">Recognized foods:</p>
              {result.foods.map((food, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-surface-2 px-3 py-2">
                  <div>
                    <p className="font-medium text-sm">{food.name}</p>
                    <p className="text-xs text-muted">{food.estimated_grams}g · confidence {Math.round(food.confidence * 100)}%</p>
                  </div>
                  <p className="font-mono text-sm font-semibold text-mint">{Math.round(food.calories)} kcal</p>
                </div>
              ))}
              <div className="flex gap-2 mt-1">
                <Button onClick={handleConfirm} className="flex-1">
                  Log these foods
                </Button>
                <Button variant="secondary" onClick={handleReset}>
                  Retake
                </Button>
              </div>
            </div>
          )}

          {!loading && !result && (
            <Button variant="ghost" onClick={handleReset} size="sm">
              Cancel
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
