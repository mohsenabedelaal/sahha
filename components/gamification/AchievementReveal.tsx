"use client";

import { motion, AnimatePresence } from "framer-motion";

interface AchievementRevealProps {
  name: string;
  icon: string;
  xpReward: number;
  visible: boolean;
  onClose: () => void;
}

export function AchievementReveal({ name, icon, xpReward, visible, onClose }: AchievementRevealProps) {
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
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", damping: 12, stiffness: 150 }}
            onClick={(e) => e.stopPropagation()}
            className="text-center px-8 py-10"
          >
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 0px rgba(52,211,153,0)",
                  "0 0 40px rgba(52,211,153,0.4)",
                  "0 0 0px rgba(52,211,153,0)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-surface border-2 border-mint text-[48px] mb-4"
            >
              {icon}
            </motion.div>
            <h2 className="text-[22px] font-extrabold text-foreground mb-1">
              Achievement Unlocked!
            </h2>
            <p className="text-[16px] font-bold text-mint mb-2">{name}</p>
            <p className="text-[14px] font-bold text-amber mb-6">+{xpReward} XP</p>
            <button
              onClick={onClose}
              className="py-3 px-10 rounded-xl bg-mint text-background text-[14px] font-bold"
            >
              Collect
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
