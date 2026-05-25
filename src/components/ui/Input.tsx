"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, id, className, ...rest },
  ref,
) {
  const inputId = id || rest.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[13px] font-medium tracking-[-0.005em] text-ink"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        className={cn(
          "h-11 w-full rounded-xl border bg-surface-sunken px-3.5 text-[14px] text-ink",
          "placeholder:text-ink-subtle",
          "transition-all duration-200 ease-apple-snap",
          "focus:outline-none focus:border-brand focus:bg-surface-card focus:shadow-ring-brand",
          "disabled:cursor-not-allowed disabled:opacity-60",
          error
            ? "border-accent-rose focus:border-accent-rose focus:shadow-[0_0_0_4px_rgb(var(--accent-rose)/0.25)]"
            : "border-line",
          className,
        )}
        aria-invalid={error ? true : undefined}
        {...rest}
      />
      {error ? (
        <span className="animate-fade-in text-[12px] text-accent-rose">
          {error}
        </span>
      ) : hint ? (
        <span className="text-[12px] text-ink-subtle">{hint}</span>
      ) : null}
    </div>
  );
});
