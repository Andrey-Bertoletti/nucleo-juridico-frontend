"use client";

import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  /** Larger pill version used in headers. */
  variant?: "icon" | "pill";
}

export function ThemeToggle({ className, variant = "icon" }: ThemeToggleProps) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  if (variant === "pill") {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
        onClick={toggle}
        className={cn(
          "relative inline-flex h-8 w-14 items-center rounded-full border border-line bg-surface-sunken",
          "transition-colors duration-300 ease-apple focus-ring",
          isDark && "bg-brand/30 border-brand/40",
          className,
        )}
      >
        <span
          className={cn(
            "absolute inline-flex h-6 w-6 items-center justify-center rounded-full bg-surface-card shadow-apple-sm",
            "transition-transform duration-300 ease-apple",
            isDark ? "translate-x-7" : "translate-x-1",
          )}
        >
          {isDark ? <MoonIcon className="h-3.5 w-3.5 text-brand" /> : <SunIcon className="h-3.5 w-3.5 text-amber-500" />}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      title={isDark ? "Tema claro" : "Tema escuro"}
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-full",
        "border border-line bg-surface-card text-ink",
        "transition duration-300 ease-apple hover:bg-surface-sunken active:scale-95 focus-ring",
        className,
      )}
    >
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-all duration-400 ease-apple",
          isDark ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100",
        )}
      >
        <SunIcon className="h-[18px] w-[18px]" />
      </span>
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-all duration-400 ease-apple",
          isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50",
        )}
      >
        <MoonIcon className="h-[18px] w-[18px]" />
      </span>
    </button>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
    </svg>
  );
}
