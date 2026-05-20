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
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={4}
          className={cn(
            "w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900",
            "placeholder:text-slate-400",
            "focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent",
            "disabled:cursor-not-allowed disabled:bg-slate-50",
            error ? "border-red-400" : "border-slate-300",
            className,
          )}
          aria-invalid={error ? true : undefined}
          {...rest}
        />
        {error ? (
          <span className="text-xs text-red-600">{error}</span>
        ) : hint ? (
          <span className="text-xs text-slate-500">{hint}</span>
        ) : null}
      </div>
    );
  },
);
