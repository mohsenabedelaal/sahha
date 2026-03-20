"use client";

import { motion, AnimatePresence } from "framer-motion";

interface XpPopupProps {
  amount: number;
  visible: boolean;
  onDone: () => void;
}

export function XpPopup({ amount, visible, onDone }: XpPopupProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: -40, scale: 1 }}
          exit={{ opacity: 0, y: -80 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          onAnimationComplete={onDone}
          className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div className="bg-amber-d text-amber text-[18px] font-extrabold px-5 py-2 rounded-full border border-amber shadow-lg">
            +{amount} XP
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
