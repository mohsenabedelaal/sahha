"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { FoodItem } from "@/lib/api/fatsecret";

interface BarcodeScannerProps {
  onFoodFound: (food: FoodItem) => void;
}

export function BarcodeScanner({ onFoodFound }: BarcodeScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html5QrRef = useRef<any>(null);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState("");

  useEffect(() => {
    return () => {
      if (html5QrRef.current) {
        html5QrRef.current.stop().catch(() => {});
      }
    };
  }, []);

  async function startScanner() {
    setError(null);
    const { Html5Qrcode } = await import("html5-qrcode");
    const scanner = new Html5Qrcode("barcode-reader");
    html5QrRef.current = scanner;

    setScanning(true);
    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        async (decodedText) => {
          await scanner.stop();
          setScanning(false);
          lookupBarcode(decodedText);
        },
        undefined,
      );
    } catch {
      setScanning(false);
      setError("Camera access denied. Enter barcode manually below.");
    }
  }

  async function stopScanner() {
    if (html5QrRef.current) {
      await html5QrRef.current.stop().catch(() => {});
      html5QrRef.current = null;
    }
    setScanning(false);
  }

  async function lookupBarcode(barcode: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/nutrition/barcode?barcode=${encodeURIComponent(barcode)}`);
      if (res.status === 404) {
        setError(`No food found for barcode: ${barcode}`);
        return;
      }
      if (!res.ok) throw new Error("Lookup failed");
      const data = await res.json();
      onFoodFound(data.food);
    } catch {
      setError("Barcode lookup failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (manualBarcode.trim()) {
      await lookupBarcode(manualBarcode.trim());
      setManualBarcode("");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Camera scanner area */}
      <div
        id="barcode-reader"
        ref={scannerRef}
        className={`w-full rounded-xl overflow-hidden bg-surface-2 ${scanning ? "min-h-[240px]" : ""}`}
      />

      {!scanning ? (
        <Button onClick={startScanner} disabled={loading}>
          📷 Open Camera Scanner
        </Button>
      ) : (
        <Button variant="secondary" onClick={stopScanner}>
          Stop Scanner
        </Button>
      )}

      {loading && (
        <p className="text-sm text-muted text-center">Looking up barcode...</p>
      )}

      {error && (
        <p className="text-sm text-red text-center">{error}</p>
      )}

      {/* Manual barcode entry */}
      <div className="flex flex-col gap-1">
        <p className="text-xs text-muted text-center">— or enter barcode manually —</p>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            placeholder="e.g. 0123456789012"
            className="flex-1 rounded-xl bg-surface-2 px-4 py-2 text-sm text-foreground placeholder:text-muted/60 border border-transparent focus:border-mint focus:ring-2 focus:ring-mint/20 focus:outline-none transition-colors"
          />
          <Button type="submit" size="sm" disabled={!manualBarcode.trim() || loading}>
            Look up
          </Button>
        </form>
      </div>
    </div>
  );
}
