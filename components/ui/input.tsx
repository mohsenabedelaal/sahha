"use client";

import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-muted">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`w-full rounded-xl bg-surface-2 px-4 py-3 text-foreground placeholder:text-muted/60 border border-transparent focus:border-mint focus:ring-2 focus:ring-mint/20 focus:outline-none transition-colors ${error ? "border-red" : ""} ${className}`}
          {...props}
        />
        {error && <p className="text-sm text-red">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
export { Input };
