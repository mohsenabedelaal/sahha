"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LessonViewerProps {
  lessonId: number;
  onClose: () => void;
  onComplete: (xpGained: number) => void;
}

interface Lesson {
  id: number;
  title: string;
  content: string;
  xp_reward: number;
}

export function LessonViewer({ lessonId, onClose, onComplete }: LessonViewerProps) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    fetch(`/api/education/lessons/${lessonId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.lesson) setLesson(data.lesson);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lessonId]);

  async function handleComplete() {
    setCompleting(true);
    try {
      const res = await fetch(`/api/education/lessons/${lessonId}`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        onComplete(data.xp?.xpGained || 0);
      }
    } catch {
      // ignore
    } finally {
      setCompleting(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background z-50 overflow-y-auto"
      >
        <div className="max-w-lg mx-auto px-4 py-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={onClose} className="text-[14px] text-tx2 font-semibold">
              ← Back
            </button>
            <span className="text-[11px] text-amber font-bold">
              ⭐ +{lesson?.xp_reward || 0} XP
            </span>
          </div>

          {loading ? (
            <div className="text-center py-20 text-[12px] text-tx3">Loading lesson...</div>
          ) : !lesson ? (
            <div className="text-center py-20 text-[12px] text-tx3">Lesson not found.</div>
          ) : (
            <>
              <div
                className="prose prose-invert prose-sm max-w-none
                  [&_h1]:text-[20px] [&_h1]:font-extrabold [&_h1]:mb-3
                  [&_h2]:text-[16px] [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-mint
                  [&_p]:text-[13px] [&_p]:leading-[1.7] [&_p]:text-tx2 [&_p]:mb-3
                  [&_li]:text-[13px] [&_li]:text-tx2 [&_li]:leading-[1.6]
                  [&_strong]:text-foreground
                  [&_blockquote]:border-l-2 [&_blockquote]:border-mint [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-tx2
                  [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3
                  [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(lesson.content) }}
              />

              <button
                onClick={handleComplete}
                disabled={completing}
                className="w-full mt-6 mb-8 py-3.5 rounded-xl bg-mint text-background text-[14px] font-bold disabled:opacity-50"
              >
                {completing ? "Completing..." : "Mark Complete ✓"}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Simple markdown to HTML converter for lesson content
function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^> (.+)$/gm, "<blockquote><p>$1</p></blockquote>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[h|u|o|b|l])/gm, (match) => match ? `<p>${match}` : "")
    .replace(/(?<![>])$/gm, "</p>");
}
