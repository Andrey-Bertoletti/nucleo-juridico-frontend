"use client";

import { useEffect, useState } from "react";

import { AccessDenied } from "@/components/feedback/AccessDenied";
import { EmptyState } from "@/components/feedback/EmptyState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { Card } from "@/components/ui/Card";
import { useAttendanceDetail } from "@/features/attendances/AttendanceDetailContext";
import { useAuth } from "@/features/auth/useAuth";
import {
  TriageForm,
  type TriageFormAction,
} from "@/features/triage/TriageForm";
import type {
  TriageFormInput,
  TriageFormOutput,
} from "@/features/triage/TriageFormSchema";
import { ApiError } from "@/services/api";
import { sendAttendanceToTeacher } from "@/services/attendances";
import {
  createTriage,
  getTriage,
  updateTriage,
} from "@/services/triage";
import type { Triage } from "@/types/triage";

const FINAL_STATUSES = new Set(["finalizado", "arquivado"]);

export default function TriagemTab() {
  const { attendance, reload } = useAttendanceDetail();
  const { hasRole } = useAuth();

  const isAdmin = hasRole("admin_coordenacao");
  const isStudent = hasRole("aluno_estagiario");
  const isTeacher = hasRole("professor_orientador");
  const canEdit =
    (isStudent || isAdmin) && !FINAL_STATUSES.has(attendance.status);

  const [triage, setTriage] = useState<Triage | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    getTriage(attendance.id)
      .then((t) => {
        if (!cancelled) setTriage(t);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setTriage(null); // ainda não criada
        } else {
          setLoadError(
            err instanceof ApiError ? err.detail : "Erro ao carregar triagem.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [attendance.id]);

  if (loading) return <LoadingState message="Carregando triagem..." />;
  if (loadError) {
    return (
      <Card>
        <p className="text-sm text-red-700">{loadError}</p>
      </Card>
    );
  }

  // Professor sem triagem preenchida → mensagem clara.
  if (isTeacher && !isAdmin && !triage) {
    return (
      <EmptyState
        title="Triagem ainda não preenchida"
        description="O aluno responsável precisa preencher a triagem antes da análise."
      />
    );
  }

  // Sem permissão e sem triagem para visualizar → bloqueio elegante.
  if (!canEdit && !triage && !isTeacher && !isAdmin) {
    return (
      <AccessDenied message="Apenas alunos/estagiários e a coordenação podem preencher a triagem." />
    );
  }

  const defaults: Partial<TriageFormInput> | undefined = triage
    ? {
        client_report: triage.client_report ?? "",
        has_urgent_deadline: triage.has_urgent_deadline,
        urgency_description: triage.urgency_description ?? "",
        presented_documents: triage.presented_documents ?? "",
        pending_documents: triage.pending_documents ?? "",
        suggested_forwarding: triage.suggested_forwarding ?? "",
        student_notes: triage.student_notes ?? "",
      }
    : undefined;

  async function handleSubmit(
    values: TriageFormOutput,
    action: TriageFormAction,
  ) {
    setServerError(null);
    setSuccessMessage(null);
    try {
      const saved = triage
        ? await updateTriage(attendance.id, values)
        : await createTriage(attendance.id, values);
      setTriage(saved);

      if (action === "forward") {
        await sendAttendanceToTeacher(attendance.id);
        setSuccessMessage(
          "Triagem salva e atendimento encaminhado ao professor.",
        );
      } else if (action === "save") {
        setSuccessMessage("Triagem salva com sucesso.");
      } else {
        setSuccessMessage("Rascunho salvo.");
      }

      await reload();
    } catch (err) {
      setServerError(
        err instanceof ApiError
          ? err.detail
          : "Não foi possível salvar a triagem.",
      );
    }
  }

  const readOnly = !canEdit;

  return (
    <div className="flex flex-col gap-6">
      {readOnly && triage && (
        <Card>
          <p className="text-sm text-slate-600">
            {isTeacher && !isAdmin
              ? "Visualização da triagem em modo leitura."
              : FINAL_STATUSES.has(attendance.status)
                ? "Atendimento finalizado — triagem não pode ser editada."
                : "Você está visualizando a triagem em modo leitura."}
          </p>
        </Card>
      )}

      <TriageForm
        defaultValues={defaults}
        readOnly={readOnly}
        onSubmit={handleSubmit}
        serverError={serverError}
        successMessage={successMessage}
      />
    </div>
  );
}
