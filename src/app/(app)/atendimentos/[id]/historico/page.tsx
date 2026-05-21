"use client";

import { useEffect, useMemo, useState } from "react";

import { LoadingState } from "@/components/feedback/LoadingState";
import { Timeline, type TimelineEvent } from "@/components/feedback/Timeline";
import { Card } from "@/components/ui/Card";
import { useAttendanceDetail } from "@/features/attendances/AttendanceDetailContext";
import { ApiError } from "@/services/api";
import { getAttendanceHistory } from "@/services/attendances";
import {
  ATTENDANCE_STATUS_LABELS,
  HISTORY_EVENT_LABELS,
  type AttendanceHistoryItem,
  type AttendanceStatus,
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

  const events: TimelineEvent[] = useMemo(
    () => items.map(toTimelineEvent),
    [items],
  );

  if (loading) return <LoadingState message="Carregando histórico..." />;
  if (error) {
    return (
      <Card>
        <p className="text-sm text-red-700">{error}</p>
      </Card>
    );
  }

  return (
    <Timeline
      events={events}
      emptyTitle="Sem eventos registrados"
      emptyDescription="O histórico de mudanças deste atendimento aparecerá aqui."
    />
  );
}

function toTimelineEvent(item: AttendanceHistoryItem): TimelineEvent {
  const title = HISTORY_EVENT_LABELS[item.event_type] || item.event_type;
  const statusChange =
    item.old_status || item.new_status
      ? {
          fromLabel: item.old_status
            ? ATTENDANCE_STATUS_LABELS[item.old_status as AttendanceStatus] ||
              item.old_status
            : "—",
          toLabel: item.new_status
            ? ATTENDANCE_STATUS_LABELS[item.new_status as AttendanceStatus] ||
              item.new_status
            : "—",
        }
      : null;
  return {
    id: item.id,
    title,
    timestamp: item.created_at,
    userName: item.user_name,
    description: item.description,
    statusChange,
  };
}
