"use client";

import { useEffect, useState } from "react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { Card } from "@/components/ui/Card";
import { useClientDetail } from "@/features/clients/ClientDetailContext";
import { formatDateTimeBR } from "@/lib/format";
import { ApiError } from "@/services/api";
import { getClientHistory } from "@/services/clients";
import { HISTORY_EVENT_LABELS, type ClientHistoryItem } from "@/types/client";

export default function ClientHistoricoTab() {
  const { client } = useClientDetail();
  const [items, setItems] = useState<ClientHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getClientHistory(client.id)
      .then((rows) => {
        if (!cancelled) setItems(rows);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.detail : "Erro ao carregar histórico.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [client.id]);

  if (loading) return <LoadingState message="Carregando histórico..." />;
  if (error)
    return (
      <Card>
        <p className="text-sm text-red-700">{error}</p>
      </Card>
    );
  if (items.length === 0) {
    return (
      <EmptyState
        title="Sem eventos registrados"
        description="O histórico do cliente aparecerá aqui a partir do próximo evento."
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
            {item.description && (
              <p className="mt-2 text-sm text-slate-700">{item.description}</p>
            )}
            {item.changes && Object.keys(item.changes).length > 0 && (
              <ChangesList changes={item.changes} />
            )}
          </Card>
        </li>
      ))}
    </ol>
  );
}

function ChangesList({ changes }: { changes: Record<string, unknown> }) {
  const entries = Object.entries(changes);
  return (
    <dl className="mt-3 space-y-1 rounded-md bg-slate-50 px-3 py-2 text-xs">
      {entries.map(([field, value]) => (
        <div key={field} className="grid grid-cols-3 gap-2">
          <dt className="font-medium text-slate-600">{field}</dt>
          <dd className="col-span-2 text-slate-700">{describe(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function describe(value: unknown): string {
  if (
    value &&
    typeof value === "object" &&
    "from" in value &&
    "to" in value
  ) {
    const { from, to } = value as { from: unknown; to: unknown };
    return `${stringify(from)} → ${stringify(to)}`;
  }
  return stringify(value);
}

function stringify(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
