"use client";

import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { BarChart, type BarRow } from "@/features/reports/BarChart";
import { StatCard } from "@/features/reports/StatCard";
import { useAuth } from "@/features/auth/useAuth";
import { ApiError } from "@/services/api";
import {
  listLegalAreas,
  listStudents,
  listTeachers,
  type LegalArea,
  type UserOption,
} from "@/services/catalogs";
import {
  getReportsByArea,
  getReportsByStatus,
  getReportsByStudent,
  getReportsByTeacher,
  getReportsSummary,
  exportReportPDF,
  exportReportExcel,
} from "@/services/reports";
import { ATTENDANCE_STATUS_TONES } from "@/types/attendance";
import type {
  AreaCount,
  ProductivityRow,
  ReportsSummary,
  StatusCount,
} from "@/types/reports";

const STATUS_TONE_TO_BAR: Record<string, BarRow["tone"]> = {
  blue: "blue",
  amber: "amber",
  emerald: "emerald",
  indigo: "indigo",
  rose: "rose",
  violet: "violet",
  neutral: "neutral",
  slate: "neutral",
};

export default function RelatoriosPage() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin_coordenacao");

  // Filtros
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [legalAreaId, setLegalAreaId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [studentId, setStudentId] = useState("");
  const [teacherId, setTeacherId] = useState("");

  // Catálogos
  const [legalAreas, setLegalAreas] = useState<LegalArea[]>([]);
  const [students, setStudents] = useState<UserOption[]>([]);
  const [teachers, setTeachers] = useState<UserOption[]>([]);

  // Dados
  const [summary, setSummary] = useState<ReportsSummary | null>(null);
  const [byStatus, setByStatus] = useState<StatusCount[]>([]);
  const [byArea, setByArea] = useState<AreaCount[]>([]);
  const [byStudent, setByStudent] = useState<ProductivityRow[]>([]);
  const [byTeacher, setByTeacher] = useState<ProductivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listLegalAreas(), listStudents(), listTeachers()])
      .then(([las, ss, ts]) => {
        setLegalAreas(las);
        setStudents(ss);
        setTeachers(ts);
      })
      .catch(() => {
        /* auxiliar */
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const filters = {
      from: from || undefined,
      to: to || undefined,
      legal_area_id: legalAreaId || undefined,
      student_id: studentId || undefined,
      teacher_id: teacherId || undefined,
    };

    Promise.all([
      getReportsSummary(filters),
      getReportsByStatus(filters),
      getReportsByArea({
        from: filters.from,
        to: filters.to,
        student_id: filters.student_id,
        teacher_id: filters.teacher_id,
      }),
      getReportsByStudent({
        from: filters.from,
        to: filters.to,
        legal_area_id: filters.legal_area_id,
      }),
      getReportsByTeacher({
        from: filters.from,
        to: filters.to,
        legal_area_id: filters.legal_area_id,
      }),
    ])
      .then(([sm, st, ar, st_p, tc_p]) => {
        if (cancelled) return;
        setSummary(sm);
        setByStatus(st);
        setByArea(ar);
        setByStudent(st_p);
        setByTeacher(tc_p);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.detail
              : "Erro ao carregar relatórios.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [from, to, legalAreaId, studentId, teacherId]);

  // O statusFilter no front é meramente visual (destaca cards) — não vai pra API
  // já que summary/by-status devolvem todos. Mantemos no UI para conformar com a spec.
  const filteredByStatus = useMemo(
    () =>
      statusFilter
        ? byStatus.filter((s) => s.status === statusFilter)
        : byStatus,
    [byStatus, statusFilter],
  );

  const statusBarRows: BarRow[] = filteredByStatus.map((s) => ({
    label: s.label,
    value: s.count,
    tone:
      STATUS_TONE_TO_BAR[
        ATTENDANCE_STATUS_TONES[
          s.status as keyof typeof ATTENDANCE_STATUS_TONES
        ] ?? "blue"
      ] ?? "blue",
  }));

  const areaBarRows: BarRow[] = byArea.map((a) => ({
    label: a.legal_area_name || "Sem área",
    value: a.count,
    tone: "blue",
  }));

  function buildExportFilters() {
    return {
      from: from || undefined,
      to: to || undefined,
      legal_area_id: legalAreaId || undefined,
      student_id: studentId || undefined,
      teacher_id: teacherId || undefined,
    };
  }

  function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  async function handleExportPDF() {
    setExportingPdf(true);
    setExportError(null);
    try {
      const blob = await exportReportPDF(buildExportFilters());
      triggerDownload(blob, `relatorio_nucleo_juridico_${todayISO()}.pdf`);
    } catch {
      setExportError("Erro ao exportar PDF. Tente novamente.");
    } finally {
      setExportingPdf(false);
    }
  }

  async function handleExportExcel() {
    setExportingExcel(true);
    setExportError(null);
    try {
      const blob = await exportReportExcel(buildExportFilters());
      triggerDownload(blob, `relatorio_nucleo_juridico_${todayISO()}.xlsx`);
    } catch {
      setExportError("Erro ao exportar Excel. Tente novamente.");
    } finally {
      setExportingExcel(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Relatórios</h1>
          <p className="text-sm text-slate-500">
            Indicadores e produtividade do núcleo
            {isAdmin ? "." : " (escopo do seu perfil)."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportPDF}
            isLoading={exportingPdf}
            disabled={exportingPdf || exportingExcel}
          >
            Exportar PDF
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportExcel}
            isLoading={exportingExcel}
            disabled={exportingPdf || exportingExcel}
          >
            Exportar Excel
          </Button>
        </div>
      </div>

      {exportError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700 animate-fade-in">
          {exportError}
        </div>
      )}

      <Card>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <Input
            label="De"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <Input
            label="Até"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <Select
            label="Área jurídica"
            value={legalAreaId}
            onChange={(e) => setLegalAreaId(e.target.value)}
          >
            <option value="">Todas</option>
            {legalAreas.map((la) => (
              <option key={la.id} value={la.id}>
                {la.name}
              </option>
            ))}
          </Select>
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos</option>
            {byStatus.map((s) => (
              <option key={s.status} value={s.status}>
                {s.label}
              </option>
            ))}
          </Select>
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
          <Select
            label="Professor"
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
          >
            <option value="">Todos</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {loading ? (
        <LoadingState message="Calculando relatórios..." />
      ) : error || !summary ? (
        <Card>
          <p className="text-sm text-red-700">
            {error || "Não foi possível carregar."}
          </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <StatCard
              label="Total de atendimentos"
              value={summary.total}
              tone="blue"
            />
            <StatCard
              label="Urgentes"
              value={summary.urgentes}
              tone="rose"
            />
            <StatCard
              label="Finalizados"
              value={summary.counters.finalizado}
              tone="emerald"
            />
            <StatCard
              label="Em análise"
              value={
                summary.counters.encaminhado_ao_professor +
                summary.counters.em_analise_pelo_professor +
                summary.counters.correcao_solicitada
              }
              tone="indigo"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card title="Por status">
              <BarChart
                rows={statusBarRows}
                emptyMessage="Sem atendimentos para o filtro."
              />
            </Card>
            <Card title="Por área jurídica">
              <BarChart rows={areaBarRows} emptyMessage="Sem dados por área." />
            </Card>
          </div>

          <Card title="Produtividade por aluno">
            <ProductivityTable rows={byStudent} />
          </Card>
          <Card title="Produtividade por professor">
            <ProductivityTable rows={byTeacher} />
          </Card>
        </>
      )}
    </div>
  );
}

function ProductivityTable({ rows }: { rows: ProductivityRow[] }) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="Sem dados"
        description="Nenhum atendimento atribuído no período."
      />
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-2">Nome</th>
            <th className="px-4 py-2">Total</th>
            <th className="px-4 py-2">Em andamento</th>
            <th className="px-4 py-2">Finalizados</th>
            <th className="px-4 py-2">Urgentes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.user_id}
              className="border-b border-slate-50 last:border-b-0"
            >
              <td className="px-4 py-2 font-medium text-slate-900">
                {r.user_name}
              </td>
              <td className="px-4 py-2 text-slate-700">{r.total}</td>
              <td className="px-4 py-2 text-slate-700">{r.em_andamento}</td>
              <td className="px-4 py-2 text-emerald-700">{r.finalizados}</td>
              <td className="px-4 py-2 text-rose-700">{r.urgentes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
