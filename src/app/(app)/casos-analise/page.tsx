"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AccessDenied } from "@/components/feedback/AccessDenied";
import { EmptyState } from "@/components/feedback/EmptyState";
import { LoadingState } from "@/components/feedback/LoadingState";
import {
  AttendanceStatusBadge,
  UrgencyBadge,
} from "@/components/feedback/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/features/auth/useAuth";
import { formatDateTimeBR } from "@/lib/format";
import { ApiError } from "@/services/api";
import {
  listLegalAreas,
  listStudents,
  type LegalArea,
  type UserOption,
} from "@/services/catalogs";
import { listTeacherCases } from "@/services/orientations";
import type { AttendanceStatus } from "@/types/attendance";
import type { TeacherCaseItem } from "@/types/orientation";

export default function CasosAnalisePage() {
  const { hasRole } = useAuth();
  const allowed = hasRole("professor_orientador", "admin_coordenacao");

  const [cases, setCases] = useState<TeacherCaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [legalAreaId, setLegalAreaId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [urgency, setUrgency] = useState<"" | "true" | "false">("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [includeFinished, setIncludeFinished] = useState(false);

  const [legalAreas, setLegalAreas] = useState<LegalArea[]>([]);
  const [students, setStudents] = useState<UserOption[]>([]);

  const debounced = useDebounced(search, 400);

  useEffect(() => {
    if (!allowed) return;
    Promise.all([listLegalAreas(), listStudents()])
      .then(([las, ss]) => {
        setLegalAreas(las);
        setStudents(ss);
      })
      .catch(() => {
        /* catálogos auxiliares — falha silenciosa */
      });
  }, [allowed]);

  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    listTeacherCases({
      search: debounced || undefined,
      legal_area_id: legalAreaId || undefined,
      student_id: studentId || undefined,
      urgency:
        urgency === "" ? undefined : urgency === "true" ? true : false,
      from: fromDate || undefined,
      to: toDate || undefined,
      include_finished: includeFinished || undefined,
    })
      .then((rows) => {
        if (!cancelled) setCases(rows);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError ? err.detail : "Erro ao carregar casos.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [
    allowed,
    debounced,
    legalAreaId,
    studentId,
    urgency,
    fromDate,
    toDate,
    includeFinished,
  ]);

  const isFiltering = useMemo(
    () =>
      Boolean(
        debounced ||
          legalAreaId ||
          studentId ||
          urgency ||
          fromDate ||
          toDate ||
          includeFinished,
      ),
    [
      debounced,
      legalAreaId,
      studentId,
      urgency,
      fromDate,
      toDate,
      includeFinished,
    ],
  );

  if (!allowed) {
    return (
      <AccessDenied message="Esta área é exclusiva para professores orientadores e a coordenação." />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Casos para Análise
        </h1>
        <p className="text-sm text-slate-500">
          Atendimentos encaminhados para sua análise. Por padrão, casos
          finalizados e arquivados não aparecem.
        </p>
      </div>

      <Card>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <Input
              label="Buscar por cliente"
              placeholder="Nome do assistido..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            label="Urgência"
            value={urgency}
            onChange={(e) =>
              setUrgency(e.target.value as "" | "true" | "false")
            }
          >
            <option value="">Todas</option>
            <option value="true">Apenas urgentes</option>
            <option value="false">Apenas normais</option>
          </Select>
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
          <label className="mt-6 inline-flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
            <input
              type="checkbox"
              checked={includeFinished}
              onChange={(e) => setIncludeFinished(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            Incluir casos finalizados / arquivados
          </label>
        </div>
      </Card>

      {loading ? (
        <LoadingState message="Carregando casos..." />
      ) : error ? (
        <Card>
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      ) : cases.length === 0 ? (
        <EmptyState
          title={
            isFiltering ? "Nenhum caso encontrado" : "Sem casos para análise"
          }
          description={
            isFiltering
              ? "Tente ajustar os filtros."
              : "Casos encaminhados por alunos aparecerão aqui."
          }
        />
      ) : (
        <Card className="overflow-x-auto !p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Área jurídica</th>
                <th className="px-4 py-3">Aluno</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Urgência</th>
                <th className="px-4 py-3">Enviado em</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    <Link
                      href={`/casos-analise/${c.id}`}
                      className="hover:underline underline-offset-2"
                    >
                      {c.client_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {c.legal_area_name || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {c.student_name || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <AttendanceStatusBadge value={c.status as AttendanceStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <UrgencyBadge urgency={c.urgency} />
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {formatDateTimeBR(c.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/casos-analise/${c.id}`}>
                      <Button size="sm">Analisar</Button>
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

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
