"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { AppointmentStatusBadge } from "@/components/feedback/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import {
  APPOINTMENT_STATUS_TONES,
  type AppointmentListItem,
} from "@/types/appointment";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const TONE_DOT: Record<string, string> = {
  blue: "bg-blue-500",
  indigo: "bg-indigo-500",
  emerald: "bg-emerald-500",
  rose: "bg-rose-500",
  amber: "bg-amber-500",
  neutral: "bg-slate-400",
  slate: "bg-slate-400",
  violet: "bg-violet-500",
};

interface AppointmentsCalendarProps {
  appointments: AppointmentListItem[];
  /** Mês exibido (1-12). */
  month: number;
  /** Ano exibido. */
  year: number;
  onChangeMonth: (year: number, month: number) => void;
}

export function AppointmentsCalendar({
  appointments,
  month,
  year,
  onChangeMonth,
}: AppointmentsCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const cells = useMemo(() => buildCells(year, month), [year, month]);
  const byDate = useMemo(() => groupByDate(appointments), [appointments]);

  const todayIso = toIsoLocal(new Date());

  function go(deltaMonths: number) {
    const d = new Date(year, month - 1 + deltaMonths, 1);
    onChangeMonth(d.getFullYear(), d.getMonth() + 1);
  }

  function goToday() {
    const d = new Date();
    onChangeMonth(d.getFullYear(), d.getMonth() + 1);
    setSelectedDay(toIsoLocal(d));
  }

  const selectedAppointments = selectedDay ? byDate[selectedDay] ?? [] : [];

  return (
    <div className="flex flex-col gap-4">
      <Card className="!p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => go(-1)}
            >
              ← Mês anterior
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={goToday}
            >
              Hoje
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => go(1)}
            >
              Próximo mês →
            </Button>
          </div>
          <h2 className="text-base font-semibold text-slate-900">
            {MONTHS[month - 1]} de {year}
          </h2>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200">
          {WEEKDAYS.map((wd) => (
            <div
              key={wd}
              className="bg-slate-50 px-2 py-2 text-center text-[11px] font-medium uppercase tracking-wide text-slate-500"
            >
              {wd}
            </div>
          ))}
          {cells.map((cell) => {
            const iso = cell.iso;
            const items = byDate[iso] || [];
            const inMonth = cell.month === month;
            const isToday = iso === todayIso;
            const isSelected = iso === selectedDay;
            return (
              <button
                key={iso}
                type="button"
                onClick={() => setSelectedDay(iso)}
                className={cn(
                  "min-h-[96px] bg-white p-2 text-left transition-colors",
                  !inMonth && "bg-slate-50/60 text-slate-400",
                  isSelected && "ring-2 ring-inset ring-slate-900",
                  !isSelected && "hover:bg-slate-50",
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                      isToday
                        ? "bg-slate-900 text-white"
                        : inMonth
                          ? "text-slate-700"
                          : "text-slate-400",
                    )}
                  >
                    {cell.day}
                  </span>
                  {items.length > 0 && (
                    <span className="text-[10px] font-medium text-slate-500">
                      {items.length}
                    </span>
                  )}
                </div>

                <ul className="mt-1 space-y-1">
                  {items.slice(0, 3).map((it) => {
                    const tone = APPOINTMENT_STATUS_TONES[it.status];
                    return (
                      <li
                        key={it.id}
                        className="flex items-center gap-1 truncate text-[11px] text-slate-700"
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 shrink-0 rounded-full",
                            TONE_DOT[tone] ?? "bg-slate-400",
                          )}
                        />
                        <span className="truncate">
                          {it.appointment_time
                            ? `${it.appointment_time.slice(0, 5)} `
                            : ""}
                          {it.client_name}
                        </span>
                      </li>
                    );
                  })}
                  {items.length > 3 && (
                    <li className="text-[11px] font-medium text-slate-500">
                      +{items.length - 3} mais
                    </li>
                  )}
                </ul>
              </button>
            );
          })}
        </div>
      </Card>

      {selectedDay && (
        <Card title={`Retornos de ${formatBrDate(selectedDay)}`}>
          {selectedAppointments.length === 0 ? (
            <p className="text-sm text-slate-500">
              Sem retornos agendados para este dia.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {selectedAppointments.map((it) => (
                <li
                  key={it.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {it.appointment_time
                        ? `${it.appointment_time.slice(0, 5)} · `
                        : ""}
                      {it.client_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {it.reason || "Sem motivo informado"}
                      {it.responsible_name && ` · ${it.responsible_name}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <AppointmentStatusBadge value={it.status} />
                    <Link href={`/agenda/${it.id}`}>
                      <Button size="sm" variant="secondary">
                        Abrir
                      </Button>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
interface CalendarCell {
  iso: string;
  day: number;
  month: number;
  year: number;
}

function buildCells(year: number, month: number): CalendarCell[] {
  const first = new Date(year, month - 1, 1);
  const startWeekday = first.getDay(); // 0..6 (dom..sáb)
  const cells: CalendarCell[] = [];

  // Days antes do dia 1 (mês anterior)
  for (let i = startWeekday; i > 0; i--) {
    const d = new Date(year, month - 1, 1 - i);
    cells.push(cellFrom(d));
  }
  // Dias do mês atual
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(cellFrom(new Date(year, month - 1, d)));
  }
  // Completa até múltiplo de 7 (42 = 6 linhas)
  while (cells.length % 7 !== 0 || cells.length < 42) {
    const last = cells[cells.length - 1]!;
    const next = new Date(last.year, last.month - 1, last.day + 1);
    cells.push(cellFrom(next));
  }
  return cells;
}

function cellFrom(d: Date): CalendarCell {
  return {
    iso: toIsoLocal(d),
    day: d.getDate(),
    month: d.getMonth() + 1,
    year: d.getFullYear(),
  };
}

function toIsoLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function groupByDate(
  items: AppointmentListItem[],
): Record<string, AppointmentListItem[]> {
  const map: Record<string, AppointmentListItem[]> = {};
  for (const it of items) {
    const key = it.appointment_date.slice(0, 10);
    (map[key] ??= []).push(it);
  }
  for (const k of Object.keys(map)) {
    map[k]!.sort((a, b) =>
      (a.appointment_time || "").localeCompare(b.appointment_time || ""),
    );
  }
  return map;
}

function formatBrDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
