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
import { useAuth } from "@/features/auth/useAuth";
import { BarChart } from "@/features/reports/BarChart";
import { StatCard } from "@/features/reports/StatCard";
import { formatDateTimeBR } from "@/lib/format";
import { ApiError } from "@/services/api";
import {
  getDashboard,
  getPendingDocuments,
  getPendingTeacherAnalysis,
  getReportsByArea,
} from "@/services/reports";
import { ROLE_LABELS } from "@/types/auth";
import type { AttendanceListItem } from "@/types/attendance";
import type { AreaCount, DashboardResponse } from "@/types/reports";

export default function DashboardPage() {
  const { user, hasRole } = useAuth();
  const isStudent = hasRole("aluno_estagiario");
  const isTeacher = hasRole("professor_orientador");
  const isAdmin = hasRole("admin_coordenacao");

  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [pendingDocs, setPendingDocs] = useState<AttendanceListItem[]>([]);
  const [pendingAnalysis, setPendingAnalysis] = useState<AttendanceListItem[]>(
    [],
  );
  const [byArea, setByArea] = useState<AreaCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      getDashboard(),
      getPendingDocuments().catch(() => [] as AttendanceListItem[]),
      getPendingTeacherAnalysis().catch(() => [] as AttendanceListItem[]),
      isAdmin
        ? getReportsByArea().catch(() => [] as AreaCount[])
        : Promise.resolve([] as AreaCount[]),
    ])
      .then(([d, pd, pa, ar]) => {
        if (cancelled) return;
        setDashboard(d);
        setPendingDocs(pd);
        setPendingAnalysis(pa);
        setByArea(ar);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.detail : "Erro ao carregar dashboard.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  if (loading) return <LoadingState message="Carregando dashboard..." />;
  if (error || !dashboard) {
    return (
      <Card>
        <p className="text-sm text-red-700">
          {error || "Não foi possível carregar o dashboard."}
        </p>
      </Card>
    );
  }

  const greetingRole = user ? ROLE_LABELS[user.role] : "";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Bem-vindo(a), {user?.name}. Visão de {greetingRole}.
        </p>
      </div>

      {isStudent && (
        <StudentDashboard
          dashboard={dashboard}
          pendingDocs={pendingDocs}
        />
      )}
      {isTeacher && !isAdmin && (
        <TeacherDashboard
          dashboard={dashboard}
          pendingAnalysis={pendingAnalysis}
        />
      )}
      {isAdmin && (
        <AdminDashboard
          dashboard={dashboard}
          pendingDocs={pendingDocs}
          pendingAnalysis={pendingAnalysis}
          byArea={byArea}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
function StudentDashboard({
  dashboard,
  pendingDocs,
}: {
  dashboard: DashboardResponse;
  pendingDocs: AttendanceListItem[];
}) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard
          label="Meus atendimentos"
          value={dashboard.total}
          description="No total (todos os status)"
          tone="blue"
        />
        <StatCard
          label="Retornos hoje"
          value={dashboard.appointments_today}
          description="Agendamentos do dia"
          tone="indigo"
        />
        <StatCard
          label="Pendências urgentes"
          value={dashboard.urgentes}
          description="Casos marcados como urgentes"
          tone="rose"
        />
        <StatCard
          label="Aguardando documentos"
          value={dashboard.pending_documents}
          tone="amber"
        />
      </div>

      <PendingListCard
        title="Atendimentos aguardando documentos"
        items={pendingDocs}
        emptyTitle="Sem pendências"
        emptyDescription="Você não tem atendimentos aguardando documentos."
      />
    </>
  );
}

// ---------------------------------------------------------------------------
function TeacherDashboard({
  dashboard,
  pendingAnalysis,
}: {
  dashboard: DashboardResponse;
  pendingAnalysis: AttendanceListItem[];
}) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard
          label="Casos para análise"
          value={dashboard.pending_teacher_analysis}
          description="Encaminhados + em análise + correção"
          tone="indigo"
        />
        <StatCard
          label="Casos urgentes"
          value={dashboard.urgentes}
          tone="rose"
        />
        <StatCard
          label="Retornos hoje"
          value={dashboard.appointments_today}
          description="Vinculados aos seus casos"
          tone="blue"
        />
        <StatCard
          label="Finalizados"
          value={dashboard.counters.finalizado}
          description="Total no período"
          tone="emerald"
        />
      </div>

      <PendingListCard
        title="Casos aguardando sua análise"
        items={pendingAnalysis}
        action={
          <Link href="/casos-analise">
            <Button variant="secondary" size="sm">
              Ver todos
            </Button>
          </Link>
        }
        emptyTitle="Sem casos pendentes"
        emptyDescription="Nenhum atendimento foi encaminhado para sua análise."
      />
    </>
  );
}

// ---------------------------------------------------------------------------
function AdminDashboard({
  dashboard,
  pendingDocs,
  pendingAnalysis,
  byArea,
}: {
  dashboard: DashboardResponse;
  pendingDocs: AttendanceListItem[];
  pendingAnalysis: AttendanceListItem[];
  byArea: AreaCount[];
}) {
  const c = dashboard.counters;
  const statusRows = [
    { label: "Novo atendimento", value: c.novo_atendimento, tone: "blue" as const },
    { label: "Em triagem", value: c.em_triagem, tone: "amber" as const },
    { label: "Aguardando documentos", value: c.aguardando_documentos, tone: "amber" as const },
    { label: "Encaminhado ao professor", value: c.encaminhado_ao_professor, tone: "indigo" as const },
    { label: "Em análise pelo professor", value: c.em_analise_pelo_professor, tone: "indigo" as const },
    { label: "Correção solicitada", value: c.correcao_solicitada, tone: "rose" as const },
    { label: "Aguardando retorno do cliente", value: c.aguardando_retorno_cliente, tone: "amber" as const },
    { label: "Encaminhamento aprovado", value: c.encaminhamento_aprovado, tone: "violet" as const },
    { label: "Finalizado", value: c.finalizado, tone: "emerald" as const },
    { label: "Arquivado", value: c.arquivado, tone: "neutral" as const },
  ];

  const areaRows = byArea.map((a) => ({
    label: a.legal_area_name || "Sem área",
    value: a.count,
    tone: "blue" as const,
  }));

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Total de atendimentos" value={dashboard.total} tone="blue" />
        <StatCard
          label="Urgentes em aberto"
          value={dashboard.urgentes}
          tone="rose"
        />
        <StatCard
          label="Aguardando documentos"
          value={dashboard.pending_documents}
          tone="amber"
        />
        <StatCard
          label="Em análise pelo professor"
          value={dashboard.pending_teacher_analysis}
          tone="indigo"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card title="Atendimentos por status">
          <BarChart rows={statusRows} emptyMessage="Sem atendimentos no período." />
        </Card>
        <Card title="Atendimentos por área jurídica">
          <BarChart rows={areaRows} emptyMessage="Sem dados por área." />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <PendingListCard
          title="Aguardando documentos"
          items={pendingDocs}
          emptyTitle="Sem pendências"
          emptyDescription="Nenhum atendimento aguardando documentos."
        />
        <PendingListCard
          title="Em análise pelo professor"
          items={pendingAnalysis}
          emptyTitle="Sem casos em análise"
          emptyDescription="Nenhum atendimento aguardando análise."
        />
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
function PendingListCard({
  title,
  items,
  emptyTitle,
  emptyDescription,
  action,
}: {
  title: string;
  items: AttendanceListItem[];
  emptyTitle: string;
  emptyDescription: string;
  action?: React.ReactNode;
}) {
  return (
    <Card title={title} footer={action}>
      {items.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.slice(0, 6).map((a) => (
            <li
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-2 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  <Link
                    href={`/atendimentos/${a.id}`}
                    className="hover:underline"
                  >
                    {a.client_name}
                  </Link>
                </p>
                <p className="truncate text-xs text-slate-500">
                  {a.legal_area_name || "Sem área"} ·{" "}
                  {formatDateTimeBR(a.updated_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <UrgencyBadge urgency={a.urgency} />
                <AttendanceStatusBadge value={a.status} />
              </div>
            </li>
          ))}
          {items.length > 6 && (
            <li className="pt-3 text-center text-xs text-slate-500">
              +{items.length - 6} casos adicionais
            </li>
          )}
        </ul>
      )}
    </Card>
  );
}
