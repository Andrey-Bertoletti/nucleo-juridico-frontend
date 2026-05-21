import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: ReactNode;
  description?: ReactNode;
  tone?: "default" | "blue" | "amber" | "emerald" | "rose" | "indigo";
  className?: string;
}

const TONE_BORDER: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "border-slate-200",
  blue: "border-blue-200",
  amber: "border-amber-200",
  emerald: "border-emerald-200",
  rose: "border-rose-200",
  indigo: "border-indigo-200",
};

const TONE_VALUE: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "text-slate-900",
  blue: "text-blue-700",
  amber: "text-amber-700",
  emerald: "text-emerald-700",
  rose: "text-rose-700",
  indigo: "text-indigo-700",
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
        "rounded-lg border bg-white p-4 shadow-sm",
        TONE_BORDER[tone],
        className,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className={cn("mt-2 text-3xl font-semibold", TONE_VALUE[tone])}>
        {value}
      </p>
      {description && (
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      )}
    </div>
  );
}
