"use client";

interface ErrorFallbackProps {
  error: Error;
  reset: () => void;
}

export function ErrorFallback({ error, reset }: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
      <div className="text-[48px] mb-3">😵</div>
      <h2 className="text-[18px] font-extrabold mb-2">Something went wrong</h2>
      <p className="text-[12px] text-tx2 mb-5 max-w-[300px]">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <button
        onClick={reset}
        className="py-2.5 px-6 rounded-xl bg-mint text-background text-[13px] font-bold"
      >
        Try Again
      </button>
    </div>
  );
}
