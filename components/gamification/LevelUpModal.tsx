"use client";

import { motion, AnimatePresence } from "framer-motion";

interface LevelUpModalProps {
  level: number;
  visible: boolean;
  onClose: () => void;
}

export function LevelUpModal({ level, visible, onClose }: LevelUpModalProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.3, opacity: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
            className="text-center px-8 py-10"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 5, -5, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="text-[72px] mb-4"
            >
              🎉
            </motion.div>
            <h2 className="text-[28px] font-extrabold text-mint mb-2">
              Level Up!
            </h2>
            <p className="text-[18px] font-bold text-foreground mb-1">
              Level {level}
            </p>
            <p className="text-[13px] text-tx2 mb-6">
              Keep logging meals to level up faster!
            </p>
            <button
              onClick={onClose}
              className="py-3 px-10 rounded-xl bg-mint text-background text-[14px] font-bold"
            >
              Awesome!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
