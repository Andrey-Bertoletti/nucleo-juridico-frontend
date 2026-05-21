import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { formatDateTimeBR } from "@/lib/format";
import {
  DECISION_LABELS,
  type Orientation,
} from "@/types/orientation";

interface OrientationsListProps {
  orientations: Orientation[];
  emptyTitle?: string;
  emptyDescription?: string;
}

export function OrientationsList({
  orientations,
  emptyTitle = "Sem orientações registradas",
  emptyDescription = "As orientações jurídicas do professor aparecerão aqui.",
}: OrientationsListProps) {
  if (orientations.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <ol className="relative space-y-4 border-l-2 border-slate-200 pl-6">
      {orientations.map((o) => (
        <li key={o.id} className="relative">
          <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-slate-900" />
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900">
                {o.decision
                  ? DECISION_LABELS[o.decision]
                  : "Orientação sem decisão de status"}
              </h3>
              <span className="text-xs text-slate-500">
                {formatDateTimeBR(o.created_at)}
              </span>
            </div>

            <div className="mt-3 space-y-3 text-sm text-slate-700">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Orientação jurídica
                </p>
                <p className="whitespace-pre-wrap">{o.orientation_text}</p>
              </div>
              {o.teacher_notes && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Observações do professor
                  </p>
                  <p className="whitespace-pre-wrap">{o.teacher_notes}</p>
                </div>
              )}
              {o.decision && (
                <div className="pt-2">
                  <StatusBadge tone="violet">
                    Decisão: {DECISION_LABELS[o.decision]}
                  </StatusBadge>
                </div>
              )}
            </div>
          </Card>
        </li>
      ))}
    </ol>
  );
}
