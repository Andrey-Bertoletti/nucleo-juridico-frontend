import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: ReactNode;
  description?: ReactNode;
  tone?: "default" | "blue" | "amber" | "emerald" | "rose" | "indigo";
  className?: string;
}

const TONE_GLOW: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "from-ink/5 to-transparent",
  blue: "from-accent-blue/12 to-transparent",
  amber: "from-accent-amber/12 to-transparent",
  emerald: "from-accent-emerald/12 to-transparent",
  rose: "from-accent-rose/12 to-transparent",
  indigo: "from-accent-indigo/12 to-transparent",
};

const TONE_VALUE: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "text-ink",
  blue: "text-accent-blue",
  amber: "text-accent-amber",
  emerald: "text-accent-emerald",
  rose: "text-accent-rose",
  indigo: "text-accent-indigo",
};

const TONE_DOT: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "bg-ink",
  blue: "bg-accent-blue",
  amber: "bg-accent-amber",
  emerald: "bg-accent-emerald",
  rose: "bg-accent-rose",
  indigo: "bg-accent-indigo",
};

export function StatCard({
  label,
  value,
  description,
  tone = "default",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-line bg-surface-card p-5 shadow-apple-sm",
        "transition-all duration-300 ease-apple",
        "hover:-translate-y-0.5 hover:shadow-apple-md",
        className,
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br opacity-80 blur-2xl transition-opacity duration-500 group-hover:opacity-100",
          TONE_GLOW[tone],
        )}
      />
      <div className="relative">
        <div className="flex items-center gap-2">
          <span className={cn("h-1.5 w-1.5 rounded-full", TONE_DOT[tone])} />
          <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-subtle">
            {label}
          </p>
        </div>
        <p
          className={cn(
            "mt-3 text-[34px] font-semibold tracking-[-0.025em] leading-none",
            TONE_VALUE[tone],
          )}
        >
          {value}
        </p>
        {description && (
          <p className="mt-2 text-[12px] text-ink-muted">{description}</p>
        )}
      </div>
    </div>
  );
}
