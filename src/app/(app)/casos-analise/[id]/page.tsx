"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { AccessDenied } from "@/components/feedback/AccessDenied";
import { LoadingState } from "@/components/feedback/LoadingState";
import {
  AttendanceStatusBadge,
  UrgencyBadge,
} from "@/components/feedback/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/features/auth/useAuth";
import { OrientationForm } from "@/features/orientations/OrientationForm";
import { OrientationsList } from "@/features/orientations/OrientationsList";
import { formatDateBR, formatDateTimeBR, maskCpf, maskPhone } from "@/lib/format";
import { ApiError } from "@/services/api";
import { getAttendance, getAttendanceHistory } from "@/services/attendances";
import {
  listDemandTypes,
  listLegalAreas,
  listStudents,
  listTeachers,
} from "@/services/catalogs";
import { getClient } from "@/services/clients";
import { listAttendanceDocuments } from "@/services/documents";
import {
  createOrientation,
  listOrientations,
} from "@/services/orientations";
import { getTriage } from "@/services/triage";
import type {
  Attendance,
  AttendanceHistoryItem,
} from "@/types/attendance";
import { HISTORY_EVENT_LABELS } from "@/types/attendance";
import type { Client } from "@/types/client";
import { MARITAL_STATUS_LABELS } from "@/types/client";
import type { DocumentItem } from "@/types/document";
import {
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_TYPE_LABELS,
} from "@/types/document";
import type { Orientation } from "@/types/orientation";
import type { Triage } from "@/types/triage";

export default function CasoAnalisePage() {
  const { hasRole } = useAuth();
  const allowed = hasRole("professor_orientador", "admin_coordenacao");
  const params = useParams<{ id: string }>();
  const attendanceId = params.id;

  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [legalAreaName, setLegalAreaName] = useState<string | null>(null);
  const [demandTypeName, setDemandTypeName] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string | null>(null);
  const [teacherName, setTeacherName] = useState<string | null>(null);
  const [triage, setTriage] = useState<Triage | null>(null);
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [history, setHistory] = useState<AttendanceHistoryItem[]>([]);
  const [orientations, setOrientations] = useState<Orientation[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const att = await getAttendance(attendanceId);
      setAttendance(att);

      const [cli, las, dts, ts, ss, hist, ors, dl, tr] = await Promise.all([
        getClient(att.client_id).catch(() => null),
        att.legal_area_id ? listLegalAreas() : Promise.resolve([]),
        att.demand_type_id
          ? listDemandTypes(att.legal_area_id || undefined)
          : Promise.resolve([]),
        att.teacher_id ? listTeachers() : Promise.resolve([]),
        att.student_id ? listStudents() : Promise.resolve([]),
        getAttendanceHistory(att.id),
        listOrientations(att.id),
        listAttendanceDocuments(att.id).catch(() => [] as DocumentItem[]),
        getTriage(att.id).catch((err: unknown) => {
          if (err instanceof ApiError && err.status === 404) return null;
          throw err;
        }),
      ]);
      setClient(cli);
      setLegalAreaName(
        las.find((la) => la.id === att.legal_area_id)?.name ?? null,
      );
      setDemandTypeName(
        dts.find((dt) => dt.id === att.demand_type_id)?.name ?? null,
      );
      setTeacherName(ts.find((t) => t.id === att.teacher_id)?.name ?? null);
      setStudentName(ss.find((s) => s.id === att.student_id)?.name ?? null);
      setHistory(hist);
      setOrientations(ors);
      setDocs(dl);
      setTriage(tr);
    } catch (err) {
      setLoadError(
        err instanceof ApiError ? err.detail : "Erro ao carregar o caso.",
      );
    } finally {
      setLoading(false);
    }
  }, [attendanceId]);

  useEffect(() => {
    if (!allowed) return;
    void load();
  }, [allowed, load]);

  async function handleOrientationSubmit({
    orientation_text,
    teacher_notes,
    decision,
  }: {
    orientation_text: string;
    teacher_notes: string | null;
    decision: Orientation["decision"];
  }) {
    setServerError(null);
    setSuccessMessage(null);
    try {
      await createOrientation(attendanceId, {
        orientation_text,
        teacher_notes,
        decision,
      });
      await load();
      setSuccessMessage(
        decision
          ? "Decisão registrada e status atualizado."
          : "Orientação salva.",
      );
      window.setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setServerError(
        err instanceof ApiError
          ? err.detail
          : "Não foi possível registrar a orientação.",
      );
    }
  }

  if (!allowed) {
    return (
      <AccessDenied message="Esta área é exclusiva para professores orientadores e a coordenação." />
    );
  }
  if (loading) return <LoadingState message="Carregando caso..." />;
  if (loadError || !attendance) {
    return (
      <Card>
        <p className="text-sm text-red-700">
          {loadError || "Caso não encontrado."}
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Cabeçalho */}
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
                value={formatDateTimeBR(attendance.created_at)}
              />
              <Field
                label="Atualizado em"
                value={formatDateTimeBR(attendance.updated_at)}
              />
            </dl>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/atendimentos/${attendance.id}`}>
              <Button variant="secondary">Abrir no atendimento</Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Cliente + descrição */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card title="Dados do cliente">
          {client ? (
            <dl className="space-y-2 text-sm">
              <Item label="Nome" value={client.full_name} />
              <Item
                label="CPF"
                value={client.cpf ? maskCpf(client.cpf) : "—"}
              />
              <Item
                label="Telefone"
                value={client.phone ? maskPhone(client.phone) : "—"}
              />
              <Item label="E-mail" value={client.email || "—"} />
              <Item
                label="Cidade/UF"
                value={
                  [client.city, client.state].filter(Boolean).join(" / ") || "—"
                }
              />
              <Item
                label="Estado civil"
                value={
                  client.marital_status
                    ? MARITAL_STATUS_LABELS[client.marital_status]
                    : "—"
                }
              />
              <Item
                label="Data de nascimento"
                value={formatDateBR(client.birth_date)}
              />
            </dl>
          ) : (
            <p className="text-sm text-slate-500">Cliente indisponível.</p>
          )}
        </Card>

        <Card title="Resumo do atendimento">
          <div className="space-y-3 text-sm">
            <Block label="Descrição do problema" content={attendance.description} />
            <Block label="Observações iniciais" content={attendance.notes} />
          </div>
        </Card>
      </div>

      {/* Triagem */}
      <Card title="Ficha de triagem">
        {triage ? (
          <div className="space-y-3 text-sm">
            <Block label="Relato do cliente" content={triage.client_report} />
            {triage.has_urgent_deadline && (
              <Block
                label="Urgência declarada"
                content={triage.urgency_description}
              />
            )}
            <Block
              label="Documentos apresentados"
              content={triage.presented_documents}
            />
            <Block
              label="Documentos pendentes"
              content={triage.pending_documents}
            />
            <Block
              label="Encaminhamento sugerido"
              content={triage.suggested_forwarding}
            />
            <Block
              label="Observações do aluno"
              content={triage.student_notes}
            />
          </div>
        ) : (
          <p className="text-sm text-slate-500">Triagem ainda não preenchida.</p>
        )}
      </Card>

      {/* Documentos */}
      <Card title="Documentos anexados">
        {docs.length === 0 ? (
          <p className="text-sm text-slate-500">
            Sem documentos anexados ao atendimento.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {docs.map((d) => (
              <li
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-900">{d.file_name}</p>
                  <p className="text-xs text-slate-500">
                    {DOCUMENT_TYPE_LABELS[d.document_type] || d.document_type} ·{" "}
                    {DOCUMENT_STATUS_LABELS[d.status]} ·{" "}
                    {formatDateTimeBR(d.created_at)}
                  </p>
                </div>
                {d.file_url && (
                  <a
                    href={d.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-slate-700 hover:underline"
                  >
                    Visualizar
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Orientações anteriores */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-slate-900">
          Orientações registradas
        </h2>
        <OrientationsList orientations={orientations} />
      </div>

      {/* Formulário de orientação */}
      <OrientationForm
        onSubmit={handleOrientationSubmit}
        serverError={serverError}
        successMessage={successMessage}
      />

      {/* Histórico do atendimento */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-slate-900">
          Histórico do atendimento
        </h2>
        {history.length === 0 ? (
          <p className="text-sm text-slate-500">Sem eventos registrados.</p>
        ) : (
          <ol className="relative space-y-3 border-l-2 border-slate-200 pl-6">
            {history.map((h) => (
              <li key={h.id} className="relative">
                <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-slate-900" />
                <Card>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {HISTORY_EVENT_LABELS[h.event_type] || h.event_type}
                    </h3>
                    <span className="text-xs text-slate-500">
                      {formatDateTimeBR(h.created_at)}
                    </span>
                  </div>
                  {h.description && (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                      {h.description}
                    </p>
                  )}
                </Card>
              </li>
            ))}
          </ol>
        )}
      </div>
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

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="col-span-2 text-slate-800">{value}</dd>
    </div>
  );
}

function Block({
  label,
  content,
}: {
  label: string;
  content: string | null;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      {content ? (
        <p className="whitespace-pre-wrap text-slate-800">{content}</p>
      ) : (
        <p className="text-slate-400">—</p>
      )}
    </div>
  );
}
