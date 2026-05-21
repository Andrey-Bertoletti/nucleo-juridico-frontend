import type { ReactNode } from "react";

import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { formatDateTimeBR } from "@/lib/format";

export interface TimelineStatusTransition {
  /** Texto humanizado do status anterior. */
  fromLabel: string;
  /** Texto humanizado do novo status. */
  toLabel: string;
}

export interface TimelineEvent {
  id: string;
  /** Título do evento ("Atendimento aberto", "Orientação registrada"...). */
  title: string;
  /** ISO 8601 do momento do evento. */
  timestamp: string;
  /** Quem realizou (opcional). */
  userName?: string | null;
  /** Texto descritivo (frase humana). */
  description?: string | null;
  /** Mudança de status visualizada com badges. */
  statusChange?: TimelineStatusTransition | null;
  /** Conteúdo extra abaixo da descrição (chips, lista de mudanças, etc.). */
  extra?: ReactNode;
}

interface TimelineProps {
  events: TimelineEvent[];
  emptyTitle?: string;
  emptyDescription?: string;
}

export function Timeline({
  events,
  emptyTitle = "Sem eventos registrados",
  emptyDescription = "Quando algo importante acontecer, aparecerá aqui.",
}: TimelineProps) {
  if (events.length === 0) {
    return (
      <Card>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-900">{emptyTitle}</p>
          <p className="mt-1 text-xs text-slate-500">{emptyDescription}</p>
        </div>
      </Card>
    );
  }

  return (
    <ol className="relative space-y-4 border-l-2 border-slate-200 pl-6">
      {events.map((ev) => (
        <li key={ev.id} className="relative">
          <span
            aria-hidden
            className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-slate-900"
          />
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900">
                {ev.title}
              </h3>
              <span className="text-xs text-slate-500">
                {formatDateTimeBR(ev.timestamp)}
              </span>
            </div>

            {ev.userName && (
              <p className="mt-1 text-xs text-slate-500">
                Por <span className="font-medium text-slate-700">{ev.userName}</span>
              </p>
            )}

            {ev.statusChange && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <StatusBadge tone="neutral">
                  {ev.statusChange.fromLabel}
                </StatusBadge>
                <span aria-hidden>→</span>
                <StatusBadge tone="indigo">
                  {ev.statusChange.toLabel}
                </StatusBadge>
              </div>
            )}

            {ev.description && (
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                {ev.description}
              </p>
            )}

            {ev.extra && <div className="mt-3">{ev.extra}</div>}
          </Card>
        </li>
      ))}
    </ol>
  );
}
