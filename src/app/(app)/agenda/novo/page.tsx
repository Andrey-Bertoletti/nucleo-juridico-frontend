"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { AccessDenied } from "@/components/feedback/AccessDenied";
import { AppointmentForm } from "@/features/appointments/AppointmentForm";
import { type AppointmentFormOutput } from "@/features/appointments/AppointmentFormSchema";
import { useAuth } from "@/features/auth/useAuth";
import { ApiError } from "@/services/api";
import { createAppointment } from "@/services/appointments";

export default function NovoRetornoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasRole } = useAuth();
  const allowed = hasRole(
    "aluno_estagiario",
    "professor_orientador",
    "admin_coordenacao",
  );

  const lockedClient = searchParams.get("client_id") || undefined;
  const presetAttendance = searchParams.get("attendance_id") || undefined;

  const [serverError, setServerError] = useState<string | null>(null);

  if (!allowed) {
    return <AccessDenied message="Sem permissão para criar retornos." />;
  }

  async function handleSubmit(values: AppointmentFormOutput) {
    setServerError(null);
    try {
      const created = await createAppointment(values as never);
      router.push(`/agenda/${created.id}`);
    } catch (err) {
      setServerError(
        err instanceof ApiError
          ? err.detail
          : "Não foi possível criar o retorno.",
      );
      throw err;
    }
  }

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Novo retorno</h1>
        <p className="text-sm text-slate-500">
          Agende um retorno do assistido. Vincule a um atendimento quando
          possível para manter o histórico do caso.
        </p>
      </div>

      <AppointmentForm
        defaultValues={
          lockedClient
            ? { client_id: lockedClient, attendance_id: presetAttendance || "" }
            : presetAttendance
              ? { attendance_id: presetAttendance }
              : undefined
        }
        lockedClientId={lockedClient}
        onSubmit={handleSubmit}
        submitLabel="Criar retorno"
        serverError={serverError}
        onCancel={() => router.push("/agenda")}
      />
    </div>
  );
}
