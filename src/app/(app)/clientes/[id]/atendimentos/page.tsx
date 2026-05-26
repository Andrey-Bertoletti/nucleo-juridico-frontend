"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { LoadingState } from "@/components/feedback/LoadingState";
import {
  AttendanceStatusBadge,
  UrgencyBadge,
} from "@/components/feedback/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useClientDetail } from "@/features/clients/ClientDetailContext";
import { formatDateTimeBR } from "@/lib/format";
import { ApiError } from "@/services/api";
import { listAttendances } from "@/services/attendances";
import type { AttendanceListItem } from "@/types/attendance";

export default function ClientAtendimentosTab() {
  const { client } = useClientDetail();

  const [data, setData] = useState<AttendanceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    listAttendances({ client_id: client.id })
      .then((rows) => {
        if (!cancelled) setData(rows);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.detail
            : "Erro ao carregar atendimentos.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [client.id]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-ink">
            Atendimentos
          </h2>
          {!loading && !error && (
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-surface-sunken px-2 text-[12px] font-medium text-ink-muted">
              {data.length}
            </span>
          )}
        </div>
        <Link href="/atendimentos/novo">
          <Button variant="brand" size="sm">
            + Novo atendimento
          </Button>
        </Link>
      </div>

      {loading ? (
        <LoadingState message="Carregando atendimentos..." />
      ) : error ? (
        <Card>
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      ) : data.length === 0 ? (
        <EmptyState
          title="Nenhum atendimento"
          description="Este assistido ainda não possui atendimentos cadastrados."
          action={
            <Link href="/atendimentos/novo">
              <Button>Novo atendimento</Button>
            </Link>
          }
        />
      ) : (
        <Card className="overflow-x-auto !p-0">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-line-subtle bg-surface-sunken/60 text-[11px] uppercase tracking-[0.05em] text-ink-subtle">
              <tr>
                <th className="px-4 py-3 font-medium">Área jurídica</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Urgência</th>
                <th className="px-4 py-3 font-medium">Aluno</th>
                <th className="px-4 py-3 font-medium">Professor</th>
                <th className="px-4 py-3 font-medium">Atualizado em</th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.map((a, i) => (
                <tr
                  key={a.id}
                  className="border-b border-line-subtle last:border-b-0 transition-colors hover:bg-surface-sunken/60 animate-fade-in"
                  style={{
                    animationDelay: `${Math.min(i * 20, 200)}ms`,
                  }}
                >
                  <td className="px-4 py-3 text-ink-muted">
                    {a.legal_area_name || "—"}
                    {a.demand_type_name && (
                      <span className="block text-[11px] text-ink-subtle">
                        {a.demand_type_name}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <AttendanceStatusBadge value={a.status} />
                  </td>
                  <td className="px-4 py-3">
                    <UrgencyBadge urgency={a.urgency} />
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {a.student_name || "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {a.teacher_name || "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {formatDateTimeBR(a.updated_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/atendimentos/${a.id}`}
                      className="text-[12px] font-medium text-brand transition-colors hover:text-brand-hover"
                    >
                      Abrir →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
