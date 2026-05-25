"use client";

import { useEffect, type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** Bloqueia o fechamento por clique no overlay/Esc (útil durante submit). */
  locked?: boolean;
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  locked = false,
  className,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !locked) onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, locked, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in"
      onClick={() => {
        if (!locked) onClose();
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-surface-overlay/55 backdrop-blur-md"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative w-full max-w-lg rounded-2xl border border-line bg-surface-card shadow-apple-lg",
          "animate-scale-in",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-line-subtle px-6 py-4">
          <h2 className="text-[16px] font-semibold tracking-[-0.01em] text-ink">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-[13px] text-ink-muted">{description}</p>
          )}
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-line-subtle bg-surface-sunken/60 px-6 py-3 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
