"use client";

import { useState, useRef, useEffect } from "react";
import type { FoodSearchResult } from "@/lib/api/types";

interface BarcodeScannerProps {
  onResult: (food: FoodSearchResult) => void;
}

export function BarcodeScanner({ onResult }: BarcodeScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrRef = useRef<InstanceType<typeof import("html5-qrcode").Html5Qrcode> | null>(null);

  async function startScanning() {
    setScanning(true);
    setError("");

    const { Html5Qrcode } = await import("html5-qrcode");
    const scanner = new Html5Qrcode("barcode-reader");
    html5QrRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        async (decodedText) => {
          await scanner.stop();
          setScanning(false);
          await lookupBarcode(decodedText);
        },
        () => { /* ignore scan failures */ }
      );
    } catch {
      setError("Camera access denied or unavailable.");
      setScanning(false);
    }
  }

  async function lookupBarcode(code: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/nutrition/barcode?code=${encodeURIComponent(code)}`);
      if (!res.ok) throw new Error("Lookup failed");

      const data = await res.json();
      if (data.found && data.food) {
        onResult(data.food);
      } else {
        setError(`No food found for barcode: ${code}`);
      }
    } catch {
      setError("Failed to look up barcode.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    return () => {
      if (html5QrRef.current) {
        html5QrRef.current.stop().catch(() => {});
      }
    };
  }, []);

  if (scanning) {
    return (
      <div className="rounded-[14px] bg-surface border border-border p-3 text-center">
        <div id="barcode-reader" ref={scannerRef} className="rounded-lg overflow-hidden" />
        <button
          onClick={async () => {
            await html5QrRef.current?.stop();
            setScanning(false);
          }}
          className="mt-2 text-[12px] text-coral font-semibold"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={startScanning}
        disabled={loading}
        className="w-full bg-surface border border-border rounded-[14px] py-4 px-3 flex flex-col items-center gap-2 cursor-pointer transition-all active:border-amber/50 active:bg-surface-2 active:scale-[0.97] disabled:opacity-50"
      >
        <div className="w-10 h-10 rounded-xl bg-amber-d flex items-center justify-center">
          {loading ? (
            <svg className="animate-spin text-amber" width="18" height="18" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
            </svg>
          ) : (
            <svg className="text-amber" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
            </svg>
          )}
        </div>
        <span className="text-[12px] font-bold">{loading ? "Looking up..." : "Barcode"}</span>
        <span className="text-[9px] text-tx3 text-center leading-tight">Scan packaged<br />food</span>
        <span className="text-[8px] font-bold font-mono py-[2px] px-1.5 rounded bg-amber-d text-amber">
          FatSecret
        </span>
      </button>
      {error && <p className="text-[11px] text-coral mt-1 text-center">{error}</p>}
    </div>
  );
}
