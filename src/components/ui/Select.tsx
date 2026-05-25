"use client";

import { forwardRef, type SelectHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { label, error, hint, id, className, children, ...rest },
    ref,
  ) {
    const selectId = id || rest.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-[13px] font-medium tracking-[-0.005em] text-ink"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "h-11 w-full appearance-none rounded-xl border bg-surface-sunken px-3.5 pr-9 text-[14px] text-ink",
              "transition-all duration-200 ease-apple-snap",
              "focus:outline-none focus:border-brand focus:bg-surface-card focus:shadow-ring-brand",
              "disabled:cursor-not-allowed disabled:opacity-60",
              error ? "border-accent-rose" : "border-line",
              className,
            )}
            aria-invalid={error ? true : undefined}
            {...rest}
          >
            {children}
          </select>
          <svg
            aria-hidden
            viewBox="0 0 20 20"
            fill="currentColor"
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.25 4.39a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        {error ? (
          <span className="animate-fade-in text-[12px] text-accent-rose">
            {error}
          </span>
        ) : hint ? (
          <span className="text-[12px] text-ink-subtle">{hint}</span>
        ) : null}
      </div>
    );
  },
);
