import { cn } from "@/lib/utils";

export interface BarRow {
  label: string;
  value: number;
  tone?: "blue" | "indigo" | "emerald" | "rose" | "amber" | "violet" | "neutral";
}

interface BarChartProps {
  rows: BarRow[];
  emptyMessage?: string;
}

const TONE_BG: Record<NonNullable<BarRow["tone"]>, string> = {
  blue: "bg-accent-blue",
  indigo: "bg-accent-indigo",
  emerald: "bg-accent-emerald",
  rose: "bg-accent-rose",
  amber: "bg-accent-amber",
  violet: "bg-accent-violet",
  neutral: "bg-ink/30",
};

export function BarChart({ rows, emptyMessage = "Sem dados." }: BarChartProps) {
  const max = rows.reduce((m, r) => Math.max(m, r.value), 0);
  if (max === 0 || rows.length === 0) {
    return <p className="text-[13px] text-ink-muted">{emptyMessage}</p>;
  }
  return (
    <ul className="flex flex-col gap-3">
      {rows.map((row, i) => {
        const pct = max > 0 ? (row.value / max) * 100 : 0;
        return (
          <li
            key={row.label}
            className="flex flex-col gap-1.5 animate-fade-in-up"
            style={{ animationDelay: `${Math.min(i * 30, 240)}ms` }}
          >
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-medium text-ink-muted">{row.label}</span>
              <span className="font-semibold tabular-nums text-ink">
                {row.value}
              </span>
            </div>
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-surface-sunken"
              role="img"
              aria-label={`${row.label}: ${row.value}`}
            >
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-700 ease-apple",
                  TONE_BG[row.tone ?? "blue"],
                )}
                style={{ width: `${Math.max(2, pct)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
