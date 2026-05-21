"use client";

import { useEffect, useMemo, useState } from "react";

import { LoadingState } from "@/components/feedback/LoadingState";
import { Timeline, type TimelineEvent } from "@/components/feedback/Timeline";
import { Card } from "@/components/ui/Card";
import { useClientDetail } from "@/features/clients/ClientDetailContext";
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
  }, [client.id]);

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
      emptyDescription="O histórico do cadastro do cliente aparecerá aqui."
    />
  );
}

function toTimelineEvent(item: ClientHistoryItem): TimelineEvent {
  return {
    id: item.id,
    title: HISTORY_EVENT_LABELS[item.event_type] || item.event_type,
    timestamp: item.created_at,
    userName: item.user_name,
    description: item.description,
    extra: item.changes && Object.keys(item.changes).length > 0
      ? renderChanges(item.changes)
      : undefined,
  };
}

function renderChanges(changes: Record<string, unknown>) {
  const entries = Object.entries(changes);
  return (
    <dl className="space-y-1 rounded-md bg-slate-50 px-3 py-2 text-xs">
      {entries.map(([field, value]) => (
        <div key={field} className="grid grid-cols-3 gap-2">
          <dt className="font-medium text-slate-600">{humanize(field)}</dt>
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
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

const FIELD_LABELS: Record<string, string> = {
  full_name: "Nome",
  cpf: "CPF",
  rg: "RG",
  birth_date: "Nascimento",
  phone: "Telefone",
  email: "E-mail",
  address: "Endereço",
  district: "Bairro",
  city: "Cidade",
  state: "UF",
  marital_status: "Estado civil",
  profession: "Profissão",
  family_income: "Renda familiar",
  notes: "Observações",
  status: "Status",
};

function humanize(field: string): string {
  return FIELD_LABELS[field] || field;
}
