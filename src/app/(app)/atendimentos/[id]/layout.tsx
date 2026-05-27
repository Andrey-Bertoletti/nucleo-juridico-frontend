"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { LoadingState } from "@/components/feedback/LoadingState";
import {
  AttendanceStatusBadge,
  UrgencyBadge,
} from "@/components/feedback/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/features/auth/useAuth";
import { AttendanceDetailContext } from "@/features/attendances/AttendanceDetailContext";
import { cn } from "@/lib/utils";
import { ApiError } from "@/services/api";
import {
  getAttendance,
  sendAttendanceToTeacher,
} from "@/services/attendances";
import {
  listDemandTypes,
  listLegalAreas,
  listTeachers,
} from "@/services/catalogs";
import { getClient } from "@/services/clients";
import type { Attendance } from "@/types/attendance";
import type { Client } from "@/types/client";

const TABS: Array<{ label: string; segment: string }> = [
  { label: "Resumo", segment: "" },
  { label: "Triagem", segment: "triagem" },
  { label: "Documentos", segment: "documentos" },
  { label: "Orientações", segment: "orientacoes" },
  { label: "Histórico", segment: "historico" },
];

export default function AttendanceDetailLayout({
  children,
}: {
  children: ReactNode;
}) {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const { hasRole, user } = useAuth();
  const id = params.id;

  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [legalAreaName, setLegalAreaName] = useState<string | null>(null);
  const [demandTypeName, setDemandTypeName] = useState<string | null>(null);
  const [teacherName, setTeacherName] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forwarding, setForwarding] = useState(false);

  const canForward = hasRole("aluno_estagiario", "admin_coordenacao");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const att = await getAttendance(id);
      setAttendance(att);

      const [c, las, dts, ts] = await Promise.all([
        getClient(att.client_id).catch(() => null),
        att.legal_area_id ? listLegalAreas() : Promise.resolve([]),
        att.demand_type_id
          ? listDemandTypes(att.legal_area_id || undefined)
          : Promise.resolve([]),
        att.teacher_id || att.student_id ? listTeachers() : Promise.resolve([]),
      ]);
      setClient(c);
      setLegalAreaName(
        las.find((la) => la.id === att.legal_area_id)?.name ?? null,
      );
      setDemandTypeName(
        dts.find((dt) => dt.id === att.demand_type_id)?.name ?? null,
      );
      setTeacherName(ts.find((t) => t.id === att.teacher_id)?.name ?? null);
      // Para o nome do aluno: não há catálogo de "students do atendimento",
      // mas listamos com listStudents (mesma shape).
      if (att.student_id) {
        const { listStudents } = await import("@/services/catalogs");
        const ss = await listStudents();
        setStudentName(ss.find((s) => s.id === att.student_id)?.name ?? null);
      } else {
        setStudentName(null);
      }
    } catch (err) {
      setError(
        err instanceof ApiError ? err.detail : "Erro ao carregar atendimento.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSendToTeacher() {
    if (!attendance) return;
    if (!attendance.teacher_id) {
      window.alert(
        "Defina um professor responsável antes de encaminhar. Edite o atendimento e selecione um professor.",
      );
      return;
    }
    setForwarding(true);
    try {
      await sendAttendanceToTeacher(attendance.id);
      await load();
    } catch (err) {
      window.alert(
        err instanceof ApiError
          ? err.detail
          : "Não foi possível encaminhar ao professor.",
      );
    } finally {
      setForwarding(false);
    }
  }

  if (loading) return <LoadingState message="Carregando atendimento..." />;
  if (error || !attendance) {
    return (
      <Card>
        <p className="text-sm text-red-700">
          {error || "Atendimento não encontrado."}
        </p>
      </Card>
    );
  }

  const basePath = `/atendimentos/${attendance.id}`;
  const activeSegment = pathname.startsWith(`${basePath}/`)
    ? pathname.replace(`${basePath}/`, "").split("/")[0] || ""
    : "";

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-semibold text-slate-900">
                {client?.full_name ?? "Cliente"}
              </h1>
              <AttendanceStatusBadge value={attendance.status} />
              <UrgencyBadge urgency={attendance.urgency} />
            </div>
            <dl className="grid grid-cols-1 gap-x-8 gap-y-1 text-sm text-slate-600 sm:grid-cols-2 md:grid-cols-3">
              <Field label="Área jurídica" value={legalAreaName || "—"} />
              <Field label="Tipo de demanda" value={demandTypeName || "—"} />
              <Field label="Aluno responsável" value={studentName || "—"} />
              <Field label="Professor responsável" value={teacherName || "—"} />
              <Field
                label="Aberto em"
                value={new Date(attendance.created_at).toLocaleString("pt-BR")}
              />
              <Field
                label="Atualizado em"
                value={new Date(attendance.updated_at).toLocaleString("pt-BR")}
              />
            </dl>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`${basePath}/status`}>
              <Button variant="secondary">Atualizar status</Button>
            </Link>
            <Link href={`${basePath}/triagem`}>
              <Button variant="secondary">Preencher triagem</Button>
            </Link>
            <Link href={`${basePath}/documentos`}>
              <Button variant="secondary">Anexar documento</Button>
            </Link>
            <Link
              href={`/atendimentos/${attendance.id}/imprimir`}
              target="_blank"
            >
              <Button variant="secondary">Imprimir para assinatura</Button>
            </Link>
            {canForward && attendance.status !== "encaminhado_ao_professor" && (
              <Button onClick={handleSendToTeacher} isLoading={forwarding}>
                Encaminhar ao professor
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="border-b border-slate-200">
        <nav className="-mb-px flex gap-6">
          {TABS.map((tab) => {
            const href = tab.segment ? `${basePath}/${tab.segment}` : basePath;
            const active = activeSegment === tab.segment;
            return (
              <Link
                key={tab.segment || "resumo"}
                href={href}
                className={cn(
                  "border-b-2 px-1 pb-3 text-sm font-medium transition-colors",
                  active
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-700",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <AttendanceDetailContext.Provider
        value={{
          attendance,
          client,
          legalAreaName,
          demandTypeName,
          studentName,
          teacherName,
          reload: load,
          currentUserId: user?.id,
        }}
      >
        {children}
      </AttendanceDetailContext.Provider>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="text-sm text-slate-800">{value}</dd>
    </div>
  );
}
