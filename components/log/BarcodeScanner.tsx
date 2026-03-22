"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FoodSearchResult } from "@/lib/api/types";
import { BarcodeResult } from "./BarcodeResult";

type ScanState = "idle" | "scanning" | "loading" | "result" | "not_found" | "error";

interface BarcodeScannerProps {
  onResult: (food: FoodSearchResult) => void;
}

export function BarcodeScanner({ onResult }: BarcodeScannerProps) {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [detectedCode, setDetectedCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [scannedFood, setScannedFood] = useState<FoodSearchResult | null>(null);
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const processingRef = useRef(false);

  async function startScanning() {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); scannerRef.current.clear(); } catch {}
      scannerRef.current = null;
    }

    processingRef.current = false;
    setScanState("scanning");
    setErrorMsg("");
    setDetectedCode("");
    setScannedFood(null);

    await new Promise((r) => setTimeout(r, 120));

    try {
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode");

      const scanner = new Html5Qrcode("bc-reader", {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
        ],
        useBarCodeDetectorIfSupported: true,
        verbose: false,
      });
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 15,
          qrbox: (vw: number, vh: number) => ({
            width: Math.min(280, Math.floor(vw * 0.8)),
            height: Math.min(150, Math.floor(vh * 0.3)),
          }),
          videoConstraints: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        },
        (decodedText) => {
          if (processingRef.current) return;
          processingRef.current = true;

          console.log("[barcode] detected:", decodedText);
          setDetectedCode(decodedText);
          setScanState("loading");

          scanner.stop().catch(() => {}).finally(() => {
            try { scanner.clear(); } catch {}
            scannerRef.current = null;
          });

          lookupBarcode(decodedText);
        },
        () => {},
      );
    } catch (err) {
      console.error("[barcode] start error:", err);
      const isInsecure = window.location.protocol !== "https:" && window.location.hostname !== "localhost";
      if (isInsecure) {
        setErrorMsg("Camera requires HTTPS. Use 'npm run dev:mobile' and open the https:// URL on your phone.");
      } else if (err instanceof DOMException && err.name === "NotAllowedError") {
        setErrorMsg("Camera access denied. Please allow camera permissions in your browser settings.");
      } else {
        setErrorMsg("Could not start camera. Make sure no other app is using it.");
      }
      setScanState("error");
    }
  }

  const stopScanning = useCallback(async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); scannerRef.current.clear(); } catch {}
      scannerRef.current = null;
    }
    setScanState("idle");
  }, []);

  async function lookupBarcode(code: string) {
    try {
      const res = await fetch(`/api/nutrition/barcode?code=${encodeURIComponent(code)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.found && data.food) {
        setScannedFood(data.food);
        setScanState("result");
      } else {
        setScanState("not_found");
      }
    } catch {
      setErrorMsg("Couldn't reach the server. Check your connection.");
      setScanState("error");
    }
  }

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (scanState !== "scanning") return;
    const style = document.createElement("style");
    style.id = "bc-override";
    style.textContent = `
      #bc-reader { position:absolute!important; inset:0!important; overflow:hidden!important; border:none!important; padding:0!important; }
      #bc-reader video { position:absolute!important; inset:0!important; width:100%!important; height:100%!important; object-fit:cover!important; z-index:1!important; }
      #bc-reader canvas { position:absolute!important; opacity:0!important; pointer-events:none!important; }
      #bc-reader img, #bc-reader a { display:none!important; }
      #qr-shaded-region { display:none!important; }
    `;
    document.head.appendChild(style);
    return () => document.getElementById("bc-override")?.remove();
  }, [scanState]);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={startScanning}
        className="w-full bg-surface border border-border rounded-[14px] py-4 px-3 flex flex-col items-center gap-2 cursor-pointer transition-all active:border-amber/50 active:bg-surface-2 active:scale-[0.97]"
      >
        <div className="w-10 h-10 rounded-xl bg-amber-d flex items-center justify-center">
          <BarcodeIcon size={20} color="var(--amber)" />
        </div>
        <span className="text-[12px] font-bold">Barcode</span>
        <span className="text-[9px] text-tx3 text-center leading-tight">Scan packaged<br />food</span>
        <span className="text-[8px] font-bold font-mono py-[2px] px-1.5 rounded bg-amber-d text-amber">
          FatSecret
        </span>
      </button>

      <AnimatePresence>
        {/* ── SCANNING overlay ── */}
        {scanState === "scanning" && (
          <motion.div
            key="bc-scan"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[60] bg-black"
          >
            <div className="relative w-full h-full overflow-hidden">
              <div id="bc-reader" className="absolute inset-0" />

              {/* Vignette */}
              <div className="absolute inset-x-0 top-0 h-40 pointer-events-none z-10"
                style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)" }} />
              <div className="absolute inset-x-0 bottom-0 h-52 pointer-events-none z-10"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)" }} />

              {/* Top bar */}
              <div className="absolute top-0 inset-x-0 flex items-center justify-between px-5 pt-[52px] z-20">
                <button onClick={stopScanning}
                  className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center"
                >
                  <CloseIcon />
                </button>
                <span className="text-white text-[15px] font-bold tracking-[-0.3px] drop-shadow">Scan Barcode</span>
                <div className="w-10" />
              </div>

              {/* Viewfinder */}
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="relative" style={{ width: 270, height: 130 }}>
                  <span className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-[#34d399] rounded-tl-sm" />
                  <span className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-[#34d399] rounded-tr-sm" />
                  <span className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-[#34d399] rounded-bl-sm" />
                  <span className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-[#34d399] rounded-br-sm" />
                  <motion.span
                    className="absolute left-3 right-3 h-[2px] rounded-full"
                    style={{
                      background: "linear-gradient(90deg, transparent 0%, #34d399 40%, #34d399 60%, transparent 100%)",
                      boxShadow: "0 0 10px 1px rgba(52,211,153,0.6)",
                    }}
                    animate={{ top: ["8%", "84%", "8%"] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              </div>

              {/* Bottom hint */}
              <div className="absolute bottom-0 inset-x-0 pb-14 z-20 flex flex-col items-center gap-1.5">
                <p className="text-white text-[13px] font-medium">Align barcode within the frame</p>
                <p className="text-white/40 text-[11px]">Detects automatically</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── LOADING overlay ── */}
        {scanState === "loading" && (
          <motion.div
            key="bc-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center gap-7 px-8"
          >
            <div className="relative flex items-center justify-center">
              <motion.span className="absolute w-32 h-32 rounded-[28px] border-2 border-[#34d399]"
                animate={{ scale: [1, 1.55], opacity: [0.45, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }} />
              <motion.span className="absolute w-28 h-28 rounded-[26px] border border-[#34d399]"
                animate={{ scale: [1, 1.35], opacity: [0.3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3, ease: "easeOut" }} />
              <div className="w-24 h-24 rounded-[24px] flex items-center justify-center"
                style={{ background: "rgba(52,211,153,0.1)", border: "1.5px solid rgba(52,211,153,0.25)" }}>
                <BarcodeIcon size={46} color="#34d399" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-white text-[22px] font-extrabold tracking-[-0.5px]">Looking up product…</p>
              {detectedCode && (
                <p className="text-white/30 text-[11px] mt-2.5 font-mono tracking-[3px]">{detectedCode.slice(0, 13)}</p>
              )}
            </div>
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.span key={i} className="block w-2 h-2 rounded-full bg-[#34d399]"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── RESULT — Yuka-style product screen ── */}
        {scanState === "result" && scannedFood && (
          <BarcodeResult
            key="bc-result"
            food={scannedFood}
            onLog={() => {
              setScanState("idle");
              onResult(scannedFood);
            }}
            onScanAgain={() => {
              setScannedFood(null);
              startScanning();
            }}
            onClose={() => {
              setScannedFood(null);
              setScanState("idle");
            }}
          />
        )}

        {/* ── NOT FOUND ── */}
        {scanState === "not_found" && (
          <motion.div key="bc-notfound"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center gap-6 px-8"
          >
            <div className="w-24 h-24 rounded-[24px] flex items-center justify-center"
              style={{ background: "rgba(251,191,36,0.08)", border: "1.5px solid rgba(251,191,36,0.2)" }}>
              <span className="text-5xl">🔍</span>
            </div>
            <div className="text-center">
              <p className="text-white text-[22px] font-extrabold tracking-[-0.5px]">Product Not Found</p>
              <p className="text-white/50 text-[13px] mt-2.5 leading-relaxed">
                This barcode isn&apos;t in the database yet.<br />Try searching by name instead.
              </p>
              {detectedCode && (
                <p className="text-white/20 text-[11px] mt-3 font-mono tracking-[3px]">{detectedCode}</p>
              )}
            </div>
            <div className="flex gap-3 w-full max-w-[300px] mt-2">
              <button onClick={() => setScanState("idle")}
                className="flex-1 py-3.5 rounded-[14px] text-white text-[13px] font-semibold"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
                Close
              </button>
              <button onClick={startScanning}
                className="flex-1 py-3.5 rounded-[14px] bg-[#34d399] text-black text-[13px] font-bold">
                Scan Again
              </button>
            </div>
          </motion.div>
        )}

        {/* ── ERROR ── */}
        {scanState === "error" && (
          <motion.div key="bc-error"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center gap-6 px-8"
          >
            <div className="w-24 h-24 rounded-[24px] flex items-center justify-center"
              style={{ background: "rgba(248,113,113,0.08)", border: "1.5px solid rgba(248,113,113,0.2)" }}>
              <span className="text-5xl">⚠️</span>
            </div>
            <div className="text-center">
              <p className="text-white text-[22px] font-extrabold tracking-[-0.5px]">Something went wrong</p>
              <p className="text-white/50 text-[13px] mt-2.5 leading-relaxed">{errorMsg}</p>
            </div>
            <div className="flex gap-3 w-full max-w-[300px] mt-2">
              <button onClick={() => setScanState("idle")}
                className="flex-1 py-3.5 rounded-[14px] text-white text-[13px] font-semibold"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
                Cancel
              </button>
              <button onClick={startScanning}
                className="flex-1 py-3.5 rounded-[14px] bg-[#34d399] text-black text-[13px] font-bold">
                Try Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function BarcodeIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <rect x="3"    y="7" width="3.5" height="26" rx="1"    fill={color} />
      <rect x="8.5"  y="7" width="1.5" height="26" rx="0.5"  fill={color} />
      <rect x="12"   y="7" width="4"   height="26" rx="1"    fill={color} />
      <rect x="18"   y="7" width="1.5" height="26" rx="0.5"  fill={color} />
      <rect x="21.5" y="7" width="5"   height="26" rx="1"    fill={color} />
      <rect x="28.5" y="7" width="1.5" height="26" rx="0.5"  fill={color} />
      <rect x="32"   y="7" width="2.5" height="26" rx="0.75" fill={color} />
      <rect x="36"   y="7" width="1.5" height="26" rx="0.5"  fill={color} />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
      <path d="M1 1L12 12M12 1L1 12" stroke="white" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
