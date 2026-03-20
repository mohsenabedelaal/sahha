"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Alternative {
  id: string;
  title: string;
}

interface SwapModalProps {
  alternatives: Alternative[];
  loading: boolean;
  onSelect: (foodId: string) => void;
  onClose: () => void;
}

export function SwapModal({ alternatives, loading, onSelect, onClose }: SwapModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-surface rounded-t-[20px] border-t border-border p-5 pb-8"
        >
          <div className="w-10 h-1 bg-surface-3 rounded-full mx-auto mb-4" />
          <h3 className="text-[17px] font-extrabold mb-3">Swap Meal</h3>

          {loading ? (
            <div className="py-8 text-center text-[12px] text-tx3">
              Finding alternatives...
            </div>
          ) : alternatives.length === 0 ? (
            <div className="py-8 text-center text-[12px] text-tx3">
              No alternatives found.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {alternatives.map((alt) => (
                <button
                  key={alt.id}
                  onClick={() => onSelect(alt.id)}
                  className="w-full text-left px-3.5 py-3 bg-surface-2 border border-border rounded-[10px] active:border-mint transition-colors"
                >
                  <p className="text-[13px] font-semibold">{alt.title}</p>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full mt-3 py-3 rounded-xl bg-surface-2 border border-border text-[13px] font-semibold text-tx2"
          >
            Cancel
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
