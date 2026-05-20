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
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            "h-10 w-full rounded-md border bg-white px-3 text-sm text-slate-900",
            "focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent",
            "disabled:cursor-not-allowed disabled:bg-slate-50",
            error ? "border-red-400" : "border-slate-300",
            className,
          )}
          aria-invalid={error ? true : undefined}
          {...rest}
        >
          {children}
        </select>
        {error ? (
          <span className="text-xs text-red-600">{error}</span>
        ) : hint ? (
          <span className="text-xs text-slate-500">{hint}</span>
        ) : null}
      </div>
    );
  },
);
