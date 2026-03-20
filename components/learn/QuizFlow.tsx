"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  xp_reward: number;
}

interface QuizResult {
  questionId: number;
  correct: boolean;
  explanation: string;
  correctIndex: number;
}

interface QuizFlowProps {
  onClose: () => void;
  onComplete: (score: number, total: number) => void;
}

export function QuizFlow({ onClose, onComplete }: QuizFlowProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Array<{ questionId: number; selectedIndex: number }>>([]);
  const [results, setResults] = useState<QuizResult[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetch("/api/education/quiz")
      .then((r) => r.ok ? r.json() : { questions: [] })
      .then((data) => setQuestions(data.questions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleNext() {
    if (selectedIndex === null) return;

    const newAnswers = [...answers, { questionId: questions[currentIndex].id, selectedIndex }];
    setAnswers(newAnswers);
    setSelectedIndex(null);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      submitQuiz(newAnswers);
    }
  }

  async function submitQuiz(finalAnswers: typeof answers) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/education/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers }),
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data.results);
        setScore(data.score);
        onComplete(data.score, data.total);
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <p className="text-[12px] text-tx3">Loading quiz...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center gap-3">
        <p className="text-[16px] font-bold">No Quiz Available</p>
        <p className="text-[12px] text-tx2">You&apos;ve answered all questions!</p>
        <button onClick={onClose} className="py-2 px-6 rounded-lg bg-mint text-background text-[12px] font-bold">
          Back
        </button>
      </div>
    );
  }

  // Results screen
  if (results) {
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-8 text-center">
          <div className="text-[48px] mb-3">{score === questions.length ? "🎉" : score > 0 ? "👏" : "📚"}</div>
          <h2 className="text-[22px] font-extrabold mb-2">Quiz Complete!</h2>
          <p className="text-[16px] text-mint font-bold mb-6">
            {score} / {questions.length} correct
          </p>

          <div className="flex flex-col gap-3 text-left mb-6">
            {results.map((r, i) => (
              <div key={r.questionId} className={`p-3 rounded-xl border ${r.correct ? "border-mint bg-mint-d" : "border-coral bg-[rgba(251,113,133,0.05)]"}`}>
                <p className="text-[12px] font-semibold mb-1">{r.correct ? "✓" : "✗"} Q{i + 1}</p>
                <p className="text-[11px] text-tx2">{r.explanation}</p>
              </div>
            ))}
          </div>

          <button onClick={onClose} className="py-3 px-10 rounded-xl bg-mint text-background text-[14px] font-bold">
            Done
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentIndex];

  return (
    <div className="fixed inset-0 bg-background z-50">
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onClose} className="text-[14px] text-tx2 font-semibold">← Quit</button>
          <span className="text-[12px] text-tx2 font-mono">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-[4px] rounded-full bg-surface-3 mb-8">
          <div
            className="h-full rounded-full bg-mint transition-all"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <p className="text-[17px] font-bold mb-6">{question.question}</p>

            <div className="flex flex-col gap-2.5">
              {question.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedIndex(i)}
                  className={`w-full text-left py-3.5 px-4 rounded-xl border text-[13px] font-medium transition-colors ${
                    selectedIndex === i
                      ? "border-mint bg-mint-d text-mint"
                      : "border-border bg-surface text-foreground"
                  }`}
                >
                  <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>
                  {option}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={handleNext}
          disabled={selectedIndex === null || submitting}
          className="w-full mt-8 py-3.5 rounded-xl bg-mint text-background text-[14px] font-bold disabled:opacity-40"
        >
          {submitting ? "Submitting..." : currentIndex < questions.length - 1 ? "Next →" : "Submit"}
        </button>
      </div>
    </div>
  );
}
