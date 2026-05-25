import type { ReactNode } from "react";

import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { formatDateTimeBR } from "@/lib/format";

export interface TimelineStatusTransition {
  fromLabel: string;
  toLabel: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  timestamp: string;
  userName?: string | null;
  description?: string | null;
  statusChange?: TimelineStatusTransition | null;
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
          <p className="text-[14px] font-semibold text-ink">{emptyTitle}</p>
          <p className="mt-1 text-[12px] text-ink-muted">{emptyDescription}</p>
        </div>
      </Card>
    );
  }

  return (
    <ol className="relative space-y-4 border-l-2 border-line pl-6">
      {events.map((ev, i) => (
        <li
          key={ev.id}
          className="relative animate-fade-in-up"
          style={{ animationDelay: `${Math.min(i * 40, 240)}ms` }}
        >
          <span
            aria-hidden
            className="absolute -left-[31px] top-3 h-3 w-3 rounded-full bg-brand ring-4 ring-brand/15"
          />
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-[14px] font-semibold tracking-[-0.005em] text-ink">
                {ev.title}
              </h3>
              <span className="text-[12px] text-ink-subtle">
                {formatDateTimeBR(ev.timestamp)}
              </span>
            </div>

            {ev.userName && (
              <p className="mt-1 text-[12px] text-ink-subtle">
                Por <span className="font-medium text-ink-muted">{ev.userName}</span>
              </p>
            )}

            {ev.statusChange && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-ink-muted">
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
              <p className="mt-2 whitespace-pre-wrap text-[14px] text-ink-muted">
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
