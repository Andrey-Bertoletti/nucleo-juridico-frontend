"use client";

import { useEffect, useState } from "react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { AttendanceStatusBadge } from "@/components/feedback/StatusBadge";
import { Card } from "@/components/ui/Card";
import { useAttendanceDetail } from "@/features/attendances/AttendanceDetailContext";
import { formatDateTimeBR } from "@/lib/format";
import { ApiError } from "@/services/api";
import { getAttendanceHistory } from "@/services/attendances";
import {
  HISTORY_EVENT_LABELS,
  type AttendanceHistoryItem,
} from "@/types/attendance";

export default function HistoricoTab() {
  const { attendance } = useAttendanceDetail();
  const [items, setItems] = useState<AttendanceHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAttendanceHistory(attendance.id)
      .then((rows) => {
        if (!cancelled) setItems(rows);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError ? err.detail : "Erro ao carregar histórico.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [attendance.id]);

  if (loading) return <LoadingState message="Carregando histórico..." />;
  if (error) {
    return (
      <Card>
        <p className="text-sm text-red-700">{error}</p>
      </Card>
    );
  }
  if (items.length === 0) {
    return (
      <EmptyState
        title="Sem eventos registrados"
        description="O histórico de mudanças deste atendimento aparecerá aqui."
      />
    );
  }

  return (
    <ol className="relative space-y-4 border-l-2 border-slate-200 pl-6">
      {items.map((item) => (
        <li key={item.id} className="relative">
          <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-slate-900" />
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900">
                {HISTORY_EVENT_LABELS[item.event_type] || item.event_type}
              </h3>
              <span className="text-xs text-slate-500">
                {formatDateTimeBR(item.created_at)}
              </span>
            </div>

            {(item.old_status || item.new_status) && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                {item.old_status ? (
                  <AttendanceStatusBadge value={item.old_status} />
                ) : (
                  <span className="text-slate-400">—</span>
                )}
                <span aria-hidden>→</span>
                {item.new_status ? (
                  <AttendanceStatusBadge value={item.new_status} />
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </div>
            )}

            {item.description && (
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                {item.description}
              </p>
            )}
          </Card>
        </li>
      ))}
    </ol>
  );
}
