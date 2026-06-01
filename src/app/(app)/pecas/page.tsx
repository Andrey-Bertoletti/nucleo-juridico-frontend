"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { PieceStatusBadge } from "@/components/feedback/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/features/auth/useAuth";
import { cn } from "@/lib/utils";
import { formatDateTimeBR } from "@/lib/format";
import { ApiError } from "@/services/api";
import {
  listPieces,
  getPieceStats,
  getPieceSummary,
} from "@/services/pieces";
import { listStudents, type UserOption } from "@/services/catalogs";
import {
  PIECE_STATUS_LABELS,
  type PieceListItem,
  type PieceStats,
  type PieceStatus,
  type PieceStudentSummary,
} from "@/types/piece";

export default function PecasPage() {
  const { hasRole, user } = useAuth();
  const isStudent = hasRole("aluno_estagiario");
  const isTeacherOrAdmin = hasRole("professor_orientador", "admin_coordenacao");
  const canCreate = hasRole("aluno_estagiario", "admin_coordenacao");

  const [data, setData] = useState<PieceListItem[]>([]);
  const [stats, setStats] = useState<PieceStats | null>(null);
  const [summary, setSummary] = useState<PieceStudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PieceStatus | "">("");
  const [studentId, setStudentId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [students, setStudents] = useState<UserOption[]>([]);

  const debouncedSearch = useDebounced(search, 400);

  // Carregar catálogos
  useEffect(() => {
    if (isTeacherOrAdmin) {
      listStudents()
        .then(setStudents)
        .catch(() => {});
      getPieceSummary()
        .then(setSummary)
        .catch(() => {});
    }
  }, [isTeacherOrAdmin]);

  // Carregar estatísticas
  useEffect(() => {
    getPieceStats()
      .then(setStats)
      .catch(() => {});
  }, []);

  // Carregar peças
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listPieces({
      search: debouncedSearch || undefined,
      status: statusFilter || undefined,
      student_id: studentId || undefined,
      from: fromDate || undefined,
      to: toDate || undefined,
    })
      .then((rows) => {
        if (!cancelled) setData(rows);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.detail
            : "Erro ao carregar peças.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, statusFilter, studentId, fromDate, toDate]);

  const isFiltering = useMemo(
    () =>
      Boolean(
        debouncedSearch || statusFilter || studentId || fromDate || toDate,
      ),
    [debouncedSearch, statusFilter, studentId, fromDate, toDate],
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 animate-fade-in-down">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.025em] text-ink">
            Peças Processuais
          </h1>
          <p className="text-[14px] text-ink-muted">
            {isStudent
              ? "Suas entregas de peças processuais."
              : "Acompanhe e corrija as peças entregues pelos alunos."}
          </p>
        </div>
        {canCreate && (
          <Link href="/pecas/novo">
            <Button variant="brand">+ Nova Entrega</Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      {stats && <StatsCards stats={stats} />}

      {/* Quick Filters */}
      <QuickFilters
        statusFilter={statusFilter}
        isStudent={isStudent}
        clearAll={() => {
          setSearch("");
          setStatusFilter("");
          setStudentId("");
          setFromDate("");
          setToDate("");
        }}
        onApply={(patch) => {
          if (patch.statusFilter !== undefined)
            setStatusFilter(patch.statusFilter);
        }}
      />

      {/* Summary table for teachers */}
      {isTeacherOrAdmin && summary.length > 0 && (
        <SummaryTable rows={summary} />
      )}

      {/* Filter Card */}
      <Card>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <Input
              label="Buscar por título"
              placeholder="Título da peça..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as PieceStatus | "")
            }
          >
            <option value="">Todos</option>
            {(
              Object.entries(PIECE_STATUS_LABELS) as [PieceStatus, string][]
            ).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          {isTeacherOrAdmin && (
            <Select
              label="Aluno"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            >
              <option value="">Todos</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          )}
          <Input
            label="De"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <Input
            label="Até"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </Card>

      {/* Table */}
      {loading ? (
        <LoadingState message="Carregando peças..." />
      ) : error ? (
        <Card>
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      ) : data.length === 0 ? (
        <EmptyState
          title={
            isFiltering
              ? "Nenhuma peça encontrada"
              : "Sem peças entregues ainda"
          }
          description={
            isFiltering
              ? "Ajuste os filtros para encontrar o que precisa."
              : isStudent
                ? "Entregue sua primeira peça processual."
                : "Nenhum aluno entregou peças até o momento."
          }
          action={
            canCreate && !isFiltering ? (
              <Link href="/pecas/novo">
                <Button>Nova Entrega</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <PiecesTable rows={data} showStudent={isTeacherOrAdmin} />
      )}
    </div>
  );
}

/* ---------- Stats Cards ---------- */
function StatsCards({ stats }: { stats: PieceStats }) {
  const items = [
    {
      label: "Total",
      value: stats.total,
      tone: "bg-surface-sunken text-ink",
    },
    {
      label: "Entregues",
      value: stats.entregue,
      tone: "bg-accent-blue/10 text-accent-blue",
    },
    {
      label: "Em Correção",
      value: stats.em_correcao,
      tone: "bg-accent-amber/12 text-accent-amber",
    },
    {
      label: "Corrigidas",
      value: stats.corrigida,
      tone: "bg-accent-emerald/12 text-accent-emerald",
    },
    {
      label: "Devolvidas",
      value: stats.devolvida_para_ajuste,
      tone: "bg-accent-rose/12 text-accent-rose",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 animate-fade-in-up">
      {items.map((item, i) => (
        <Card
          key={item.label}
          className="animate-fade-in"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium uppercase tracking-[0.05em] text-ink-subtle">
              {item.label}
            </span>
            <span
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-lg text-[18px] font-bold",
                item.tone,
              )}
            >
              {item.value}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ---------- Quick Filters ---------- */
interface QuickFiltersProps {
  statusFilter: PieceStatus | "";
  isStudent: boolean;
  clearAll: () => void;
  onApply: (patch: { statusFilter?: PieceStatus | "" }) => void;
}

function QuickFilters({
  statusFilter,
  isStudent,
  clearAll,
  onApply,
}: QuickFiltersProps) {
  const chips: Array<{ label: string; active: boolean; onClick: () => void }> =
    [
      {
        label: "Aguardando correção",
        active: statusFilter === "entregue",
        onClick: () =>
          onApply({
            statusFilter: statusFilter === "entregue" ? "" : "entregue",
          }),
      },
      {
        label: "Em correção",
        active: statusFilter === "em_correcao",
        onClick: () =>
          onApply({
            statusFilter:
              statusFilter === "em_correcao" ? "" : "em_correcao",
          }),
      },
      {
        label: "Corrigidas",
        active: statusFilter === "corrigida",
        onClick: () =>
          onApply({
            statusFilter:
              statusFilter === "corrigida" ? "" : "corrigida",
          }),
      },
      {
        label: "Devolvidas",
        active: statusFilter === "devolvida_para_ajuste",
        onClick: () =>
          onApply({
            statusFilter:
              statusFilter === "devolvida_para_ajuste"
                ? ""
                : "devolvida_para_ajuste",
          }),
      },
    ];

  const anyActive = chips.some((c) => c.active);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button
          key={c.label}
          type="button"
          onClick={c.onClick}
          className={cn(
            "inline-flex items-center rounded-full border px-3.5 py-1.5 text-[12px] font-medium tracking-[-0.005em]",
            "transition-all duration-200 ease-apple-snap active:scale-95",
            c.active
              ? "border-brand bg-brand text-white shadow-apple-sm"
              : "border-line bg-surface-card text-ink-muted hover:bg-surface-sunken hover:text-ink",
          )}
        >
          {c.label}
        </button>
      ))}
      {anyActive && (
        <button
          type="button"
          onClick={clearAll}
          className="ml-1 inline-flex items-center rounded-full px-3 py-1.5 text-[12px] font-medium text-ink-subtle transition-colors hover:text-ink"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}

/* ---------- Summary Table ---------- */
function SummaryTable({ rows }: { rows: PieceStudentSummary[] }) {
  return (
    <Card className="overflow-x-auto !p-0">
      <div className="border-b border-line-subtle bg-surface-sunken/40 px-4 py-3">
        <h3 className="text-[13px] font-semibold text-ink">
          Resumo por Aluno
        </h3>
      </div>
      <table className="w-full text-left text-[13px]">
        <thead className="border-b border-line-subtle bg-surface-sunken/60 text-[11px] uppercase tracking-[0.05em] text-ink-subtle">
          <tr>
            <th className="px-4 py-3 font-medium">Aluno</th>
            <th className="px-4 py-3 font-medium text-center">Total</th>
            <th className="px-4 py-3 font-medium text-center">Entregues</th>
            <th className="px-4 py-3 font-medium text-center">Em Correção</th>
            <th className="px-4 py-3 font-medium text-center">Corrigidas</th>
            <th className="px-4 py-3 font-medium text-center">Devolvidas</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={r.student_id}
              className="border-b border-line-subtle last:border-b-0 transition-colors hover:bg-surface-sunken/60 animate-fade-in"
              style={{ animationDelay: `${Math.min(i * 20, 200)}ms` }}
            >
              <td className="px-4 py-3 font-medium text-ink">
                {r.student_name}
              </td>
              <td className="px-4 py-3 text-center text-ink-muted">
                {r.total}
              </td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-md bg-accent-blue/10 px-1.5 text-[11px] font-semibold text-accent-blue">
                  {r.entregue}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-md bg-accent-amber/12 px-1.5 text-[11px] font-semibold text-accent-amber">
                  {r.em_correcao}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-md bg-accent-emerald/12 px-1.5 text-[11px] font-semibold text-accent-emerald">
                  {r.corrigida}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-md bg-accent-rose/12 px-1.5 text-[11px] font-semibold text-accent-rose">
                  {r.devolvida_para_ajuste}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

/* ---------- Pieces Table ---------- */
function PiecesTable({
  rows,
  showStudent,
}: {
  rows: PieceListItem[];
  showStudent: boolean;
}) {
  return (
    <Card className="overflow-x-auto !p-0">
      <table className="w-full text-left text-[13px]">
        <thead className="border-b border-line-subtle bg-surface-sunken/60 text-[11px] uppercase tracking-[0.05em] text-ink-subtle">
          <tr>
            <th className="px-4 py-3 font-medium">Título</th>
            {showStudent && (
              <th className="px-4 py-3 font-medium">Aluno</th>
            )}
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Arquivo</th>
            <th className="px-4 py-3 font-medium">Entregue em</th>
            <th className="px-4 py-3 font-medium">Corrigido por</th>
            <th className="px-4 py-3 text-right font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p, i) => (
            <tr
              key={p.id}
              className="border-b border-line-subtle last:border-b-0 transition-colors hover:bg-surface-sunken/60 animate-fade-in"
              style={{ animationDelay: `${Math.min(i * 20, 200)}ms` }}
            >
              <td className="px-4 py-3 font-medium text-ink">
                <Link
                  href={`/pecas/${p.id}`}
                  className="transition-colors hover:text-brand"
                >
                  {p.title}
                </Link>
              </td>
              {showStudent && (
                <td className="px-4 py-3 text-ink-muted">
                  {p.student_name || "—"}
                </td>
              )}
              <td className="px-4 py-3">
                <PieceStatusBadge value={p.status} />
              </td>
              <td className="px-4 py-3 text-ink-muted">
                <span className="max-w-[160px] truncate block" title={p.file_name}>
                  {p.file_name}
                </span>
              </td>
              <td className="px-4 py-3 text-ink-muted">
                {formatDateTimeBR(p.delivered_at)}
              </td>
              <td className="px-4 py-3 text-ink-muted">
                {p.corrected_by_name || "—"}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/pecas/${p.id}`}
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
  );
}

/* ---------- Hook ---------- */
function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
