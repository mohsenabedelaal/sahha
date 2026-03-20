"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GroceryItem {
  name: string;
  count: number;
  category: string | null;
}

interface GroceryListProps {
  onClose: () => void;
}

export function GroceryList({ onClose }: GroceryListProps) {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useState(() => {
    fetch("/api/meals/plan/grocery")
      .then((r) => r.ok ? r.json() : { items: [] })
      .then((data) => setItems(data.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  });

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
          className="w-full max-w-lg bg-surface rounded-t-[20px] border-t border-border p-5 pb-8 max-h-[70vh] overflow-y-auto"
        >
          <div className="w-10 h-1 bg-surface-3 rounded-full mx-auto mb-4" />
          <h3 className="text-[17px] font-extrabold mb-3">Grocery List</h3>

          {loading ? (
            <div className="py-8 text-center text-[12px] text-tx3">Loading...</div>
          ) : items.length === 0 ? (
            <div className="py-8 text-center text-[12px] text-tx3">
              Generate a meal plan first to see your grocery list.
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {items.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-3 px-3 py-2.5 bg-surface-2 rounded-lg"
                >
                  <div className="w-5 h-5 rounded border border-border flex items-center justify-center text-[10px]">
                    ○
                  </div>
                  <span className="flex-1 text-[13px]">{item.name}</span>
                  <span className="text-[11px] text-tx2 font-mono">×{item.count}</span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full mt-4 py-3 rounded-xl bg-surface-2 border border-border text-[13px] font-semibold text-tx2"
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
