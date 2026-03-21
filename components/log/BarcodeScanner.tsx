"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FoodSearchResult } from "@/lib/api/types";

type ScanState = "idle" | "scanning" | "loading" | "not_found" | "error";

interface BarcodeScannerProps {
  onResult: (food: FoodSearchResult) => void;
}

export function BarcodeScanner({ onResult }: BarcodeScannerProps) {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [detectedCode, setDetectedCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const scannerRef = useRef<InstanceType<
    typeof import("html5-qrcode").Html5Qrcode
  > | null>(null);

  /* ── start camera ── */
  async function startScanning() {
    setScanState("scanning");
    setErrorMsg("");
    setDetectedCode("");

    // Allow the DOM to mount #bc-reader before init
    await new Promise((r) => setTimeout(r, 80));

    const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import(
      "html5-qrcode"
    );

    const scanner = new Html5Qrcode("bc-reader", {
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
      ],
      verbose: false,
    });
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 15, qrbox: { width: 270, height: 130 } },
        async (code) => {
          await scanner.stop();
          scannerRef.current = null;
          setDetectedCode(code);
          setScanState("loading");
          await lookupBarcode(code);
        },
        () => {} // per-frame failures are normal, ignore
      );
    } catch {
      setErrorMsg("Camera access denied. Please allow camera permissions.");
      setScanState("error");
    }
  }

  /* ── stop camera ── */
  async function stopScanning() {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    setScanState("idle");
  }

  /* ── API lookup ── */
  async function lookupBarcode(code: string) {
    try {
      const res = await fetch(
        `/api/nutrition/barcode?code=${encodeURIComponent(code)}`
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.found && data.food) {
        setScanState("idle");
        onResult(data.food);
      } else {
        setScanState("not_found");
      }
    } catch {
      setErrorMsg("Couldn't reach the server. Check your connection.");
      setScanState("error");
    }
  }

  /* ── cleanup on unmount ── */
  useEffect(() => {
    return () => {
      scannerRef.current?.stop().catch(() => {});
    };
  }, []);

  /* ── suppress html5-qrcode's own UI chrome while scanning ── */
  useEffect(() => {
    if (scanState !== "scanning") return;
    const style = document.createElement("style");
    style.id = "bc-override";
    style.textContent = `
      #bc-reader { background: #000 !important; }
      #bc-reader video { width:100%!important; height:100%!important; object-fit:cover!important; position:absolute!important; inset:0!important; }
      #bc-reader__dashboard { display:none!important; }
      #bc-reader__scan_region img { display:none!important; }
      #bc-reader__scan_region { background:transparent!important; border:none!important; }
    `;
    document.head.appendChild(style);
    return () => document.getElementById("bc-override")?.remove();
  }, [scanState]);

  return (
    <>
      {/* ── Trigger button (inside the 2-col grid) ── */}
      <button
        onClick={startScanning}
        className="w-full bg-surface border border-border rounded-[14px] py-4 px-3 flex flex-col items-center gap-1.5 cursor-pointer transition-all active:border-mint active:bg-surface-2 active:scale-[0.97]"
      >
        <BarcodeIcon size={28} color="currentColor" />
        <span className="text-[12px] font-bold">Scan Barcode</span>
        <span className="text-[10px] text-tx2 text-center">Packaged food lookup</span>
        <span className="text-[8px] font-bold font-mono py-[2px] px-1.5 rounded mt-0.5 bg-mint-d text-mint">
          FatSecret
        </span>
      </button>

      {/* ── Full-screen overlay ── */}
      <AnimatePresence>
        {scanState !== "idle" && (
          <motion.div
            key="bc-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[60] bg-black"
          >
            {/* ═══════════════════════ SCANNING ═══════════════════════ */}
            {scanState === "scanning" && (
              <div className="relative w-full h-full overflow-hidden">
                {/* Camera feed rendered here by html5-qrcode */}
                <div id="bc-reader" className="absolute inset-0" />

                {/* Dark vignette gradients */}
                <div
                  className="absolute inset-x-0 top-0 h-40 pointer-events-none z-10"
                  style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)" }}
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-52 pointer-events-none z-10"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)" }}
                />

                {/* Top bar */}
                <div className="absolute top-0 inset-x-0 flex items-center justify-between px-5 pt-[52px] z-20">
                  <button
                    onClick={stopScanning}
                    className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center active:bg-black/60 transition-colors"
                    aria-label="Close scanner"
                  >
                    <CloseIcon />
                  </button>
                  <span className="text-white text-[15px] font-bold tracking-[-0.3px] drop-shadow">
                    Scan Barcode
                  </span>
                  <div className="w-10" />
                </div>

                {/* Viewfinder */}
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  <div className="relative" style={{ width: 270, height: 130 }}>
                    {/* Corner brackets */}
                    <span className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-[#34d399] rounded-tl-sm" />
                    <span className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-[#34d399] rounded-tr-sm" />
                    <span className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-[#34d399] rounded-bl-sm" />
                    <span className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-[#34d399] rounded-br-sm" />

                    {/* Animated scan line */}
                    <motion.span
                      className="absolute left-3 right-3 h-[2px] rounded-full"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent 0%, #34d399 40%, #34d399 60%, transparent 100%)",
                        boxShadow: "0 0 10px 1px rgba(52,211,153,0.6)",
                      }}
                      animate={{ top: ["8%", "84%", "8%"] }}
                      transition={{
                        duration: 2.4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </div>
                </div>

                {/* Bottom instructions */}
                <div className="absolute bottom-0 inset-x-0 pb-14 z-20 flex flex-col items-center gap-1.5">
                  <p className="text-white text-[13px] font-medium">
                    Align barcode within the frame
                  </p>
                  <p className="text-white/40 text-[11px]">Detects automatically</p>
                </div>
              </div>
            )}

            {/* ═══════════════════════ LOADING ═══════════════════════ */}
            {scanState === "loading" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.22 }}
                className="h-full flex flex-col items-center justify-center gap-7 px-8"
              >
                {/* Pulsing icon */}
                <div className="relative flex items-center justify-center">
                  {/* Outer pulse */}
                  <motion.span
                    className="absolute w-32 h-32 rounded-[28px] border-2 border-[#34d399]"
                    animate={{ scale: [1, 1.55], opacity: [0.45, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                  />
                  {/* Middle pulse */}
                  <motion.span
                    className="absolute w-28 h-28 rounded-[26px] border border-[#34d399]"
                    animate={{ scale: [1, 1.35], opacity: [0.3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.3, ease: "easeOut" }}
                  />
                  {/* Icon bg */}
                  <motion.div
                    animate={{ scale: [1, 1.04, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-24 h-24 rounded-[24px] flex items-center justify-center"
                    style={{
                      background: "rgba(52,211,153,0.1)",
                      border: "1.5px solid rgba(52,211,153,0.25)",
                    }}
                  >
                    <BarcodeIcon size={46} color="#34d399" />
                  </motion.div>
                </div>

                {/* Text */}
                <div className="text-center">
                  <p className="text-white text-[22px] font-extrabold tracking-[-0.5px]">
                    Looking up product…
                  </p>
                  {detectedCode && (
                    <p className="text-white/30 text-[11px] mt-2.5 font-mono tracking-[3px]">
                      {detectedCode.slice(0, 13)}
                    </p>
                  )}
                </div>

                {/* Dot loader */}
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="block w-2 h-2 rounded-full bg-[#34d399]"
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* ═══════════════════════ NOT FOUND ═══════════════════════ */}
            {scanState === "not_found" && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24 }}
                className="h-full flex flex-col items-center justify-center gap-6 px-8"
              >
                <div
                  className="w-24 h-24 rounded-[24px] flex items-center justify-center"
                  style={{
                    background: "rgba(251,191,36,0.08)",
                    border: "1.5px solid rgba(251,191,36,0.2)",
                  }}
                >
                  <span className="text-5xl">🔍</span>
                </div>

                <div className="text-center">
                  <p className="text-white text-[22px] font-extrabold tracking-[-0.5px]">
                    Product Not Found
                  </p>
                  <p className="text-white/50 text-[13px] mt-2.5 leading-relaxed">
                    This barcode isn&apos;t in the database yet.
                    <br />
                    Try searching by name instead.
                  </p>
                  {detectedCode && (
                    <p className="text-white/20 text-[11px] mt-3 font-mono tracking-[3px]">
                      {detectedCode}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 w-full max-w-[300px] mt-2">
                  <button
                    onClick={() => setScanState("idle")}
                    className="flex-1 py-3.5 rounded-[14px] text-white text-[13px] font-semibold active:opacity-70 transition-opacity"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    Close
                  </button>
                  <button
                    onClick={startScanning}
                    className="flex-1 py-3.5 rounded-[14px] bg-[#34d399] text-black text-[13px] font-bold active:opacity-90 transition-opacity"
                  >
                    Scan Again
                  </button>
                </div>
              </motion.div>
            )}

            {/* ═══════════════════════ ERROR ═══════════════════════ */}
            {scanState === "error" && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24 }}
                className="h-full flex flex-col items-center justify-center gap-6 px-8"
              >
                <div
                  className="w-24 h-24 rounded-[24px] flex items-center justify-center"
                  style={{
                    background: "rgba(248,113,113,0.08)",
                    border: "1.5px solid rgba(248,113,113,0.2)",
                  }}
                >
                  <span className="text-5xl">⚠️</span>
                </div>

                <div className="text-center">
                  <p className="text-white text-[22px] font-extrabold tracking-[-0.5px]">
                    Something went wrong
                  </p>
                  <p className="text-white/50 text-[13px] mt-2.5 leading-relaxed">
                    {errorMsg}
                  </p>
                </div>

                <div className="flex gap-3 w-full max-w-[300px] mt-2">
                  <button
                    onClick={() => setScanState("idle")}
                    className="flex-1 py-3.5 rounded-[14px] text-white text-[13px] font-semibold active:opacity-70 transition-opacity"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={startScanning}
                    className="flex-1 py-3.5 rounded-[14px] bg-[#34d399] text-black text-[13px] font-bold active:opacity-90 transition-opacity"
                  >
                    Try Again
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── SVG helpers ── */

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
      <path
        d="M1 1L12 12M12 1L1 12"
        stroke="white"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
