"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
import { listAttendances } from "@/services/attendances";
import {
  listLegalAreas,
  listStudents,
  listTeachers,
  type LegalArea,
  type UserOption,
} from "@/services/catalogs";
import {
  ATTENDANCE_STATUS_GROUPS,
  ATTENDANCE_STATUS_LABELS,
  type AttendanceListItem,
  type AttendanceStatus,
} from "@/types/attendance";

export default function AtendimentosPage() {
  const { hasRole } = useAuth();
  const canCreate = hasRole("aluno_estagiario", "admin_coordenacao");

  const [data, setData] = useState<AttendanceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | "">("");
  const [legalAreaId, setLegalAreaId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [urgency, setUrgency] = useState<"" | "true" | "false">("");

  // Catálogos para os selects
  const [legalAreas, setLegalAreas] = useState<LegalArea[]>([]);
  const [students, setStudents] = useState<UserOption[]>([]);
  const [teachers, setTeachers] = useState<UserOption[]>([]);

  const debouncedSearch = useDebounced(search, 400);

  useEffect(() => {
    Promise.all([listLegalAreas(), listStudents(), listTeachers()])
      .then(([las, ss, ts]) => {
        setLegalAreas(las);
        setStudents(ss);
        setTeachers(ts);
      })
      .catch(() => {
        // catálogos são auxiliares — se falharem, a listagem ainda funciona
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listAttendances({
      search: debouncedSearch || undefined,
      status: statusFilter || undefined,
      legal_area_id: legalAreaId || undefined,
      student_id: studentId || undefined,
      teacher_id: teacherId || undefined,
      from: fromDate || undefined,
      to: toDate || undefined,
      urgency:
        urgency === "" ? undefined : urgency === "true" ? true : false,
    })
      .then((rows) => {
        if (!cancelled) setData(rows);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError ? err.detail : "Erro ao carregar atendimentos.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [
    debouncedSearch,
    statusFilter,
    legalAreaId,
    studentId,
    teacherId,
    fromDate,
    toDate,
    urgency,
  ]);

  const isFiltering = useMemo(
    () =>
      Boolean(
        debouncedSearch ||
          statusFilter ||
          legalAreaId ||
          studentId ||
          teacherId ||
          fromDate ||
          toDate ||
          urgency,
      ),
    [
      debouncedSearch,
      statusFilter,
      legalAreaId,
      studentId,
      teacherId,
      fromDate,
      toDate,
      urgency,
    ],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Atendimentos</h1>
          <p className="text-sm text-slate-500">
            Lista dos casos jurídicos abertos no núcleo.
          </p>
        </div>
        {canCreate && (
          <Link href="/atendimentos/novo">
            <Button>Novo atendimento</Button>
          </Link>
        )}
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
            label="Status"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as AttendanceStatus | "")
            }
          >
            <option value="">Todos</option>
            {ATTENDANCE_STATUS_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.values.map((s) => (
                  <option key={s} value={s}>
                    {ATTENDANCE_STATUS_LABELS[s]}
                  </option>
                ))}
              </optgroup>
            ))}
          </Select>
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

      {loading ? (
        <LoadingState message="Carregando atendimentos..." />
      ) : error ? (
        <Card>
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      ) : data.length === 0 ? (
        <EmptyState
          title={isFiltering ? "Nenhum atendimento encontrado" : "Sem atendimentos ainda"}
          description={
            isFiltering
              ? "Ajuste os filtros para encontrar o que precisa."
              : "Cadastre o primeiro atendimento para começar."
          }
          action={
            canCreate && !isFiltering ? (
              <Link href="/atendimentos/novo">
                <Button>Novo atendimento</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <AttendancesTable rows={data} />
      )}
    </div>
  );
}

function AttendancesTable({ rows }: { rows: AttendanceListItem[] }) {
  return (
    <Card className="overflow-x-auto !p-0">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Cliente</th>
            <th className="px-4 py-3">Área jurídica</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Urgência</th>
            <th className="px-4 py-3">Aluno</th>
            <th className="px-4 py-3">Professor</th>
            <th className="px-4 py-3">Atualizado em</th>
            <th className="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr
              key={a.id}
              className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50"
            >
              <td className="px-4 py-3 font-medium text-slate-900">
                <Link
                  href={`/atendimentos/${a.id}`}
                  className="hover:underline underline-offset-2"
                >
                  {a.client_name}
                </Link>
              </td>
              <td className="px-4 py-3 text-slate-700">
                {a.legal_area_name || "—"}
                {a.demand_type_name && (
                  <span className="block text-xs text-slate-500">
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
              <td className="px-4 py-3 text-slate-700">
                {a.student_name || "—"}
              </td>
              <td className="px-4 py-3 text-slate-700">
                {a.teacher_name || "—"}
              </td>
              <td className="px-4 py-3 text-slate-700">
                {formatDateTimeBR(a.updated_at)}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/atendimentos/${a.id}`}
                  className="text-xs font-medium text-slate-700 hover:underline"
                >
                  Abrir
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
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
