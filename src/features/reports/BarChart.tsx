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
  blue: "bg-blue-500",
  indigo: "bg-indigo-500",
  emerald: "bg-emerald-500",
  rose: "bg-rose-500",
  amber: "bg-amber-500",
  violet: "bg-violet-500",
  neutral: "bg-slate-400",
};

/**
 * Gráfico de barras horizontal simples — sem dependência externa.
 * Cada linha mostra label, valor e uma barra proporcional ao maior valor.
 */
export function BarChart({ rows, emptyMessage = "Sem dados." }: BarChartProps) {
  const max = rows.reduce((m, r) => Math.max(m, r.value), 0);
  if (max === 0 || rows.length === 0) {
    return <p className="text-sm text-slate-500">{emptyMessage}</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {rows.map((row) => {
        const pct = max > 0 ? (row.value / max) * 100 : 0;
        return (
          <li key={row.label} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">{row.label}</span>
              <span className="font-semibold text-slate-900">{row.value}</span>
            </div>
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
              role="img"
              aria-label={`${row.label}: ${row.value}`}
            >
              <div
                className={cn("h-full rounded-full", TONE_BG[row.tone ?? "blue"])}
                style={{ width: `${Math.max(2, pct)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
