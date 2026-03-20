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
        className="w-full bg-surface border border-border rounded-[14px] py-4 px-3 flex flex-col items-center gap-1.5 cursor-pointer transition-all active:border-mint active:bg-surface-2 active:scale-[0.97] disabled:opacity-50"
      >
        <span className="text-[26px]">{loading ? "⏳" : "📊"}</span>
        <span className="text-[12px] font-bold">{loading ? "Looking up..." : "Scan Barcode"}</span>
        <span className="text-[10px] text-tx2 text-center">Packaged food lookup</span>
        <span className="text-[8px] font-bold font-mono py-[2px] px-1.5 rounded mt-0.5 bg-mint-d text-mint">
          FatSecret + OFF
        </span>
      </button>
      {error && <p className="text-[11px] text-coral mt-1 text-center">{error}</p>}
    </div>
  );
}
