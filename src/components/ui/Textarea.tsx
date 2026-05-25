"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, error, hint, id, className, ...rest }, ref) {
    const textareaId = id || rest.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-[13px] font-medium tracking-[-0.005em] text-ink"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={4}
          className={cn(
            "w-full rounded-xl border bg-surface-sunken px-3.5 py-2.5 text-[14px] text-ink",
            "placeholder:text-ink-subtle",
            "transition-all duration-200 ease-apple-snap",
            "focus:outline-none focus:border-brand focus:bg-surface-card focus:shadow-ring-brand",
            "disabled:cursor-not-allowed disabled:opacity-60",
            error ? "border-accent-rose" : "border-line",
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
  },
);
