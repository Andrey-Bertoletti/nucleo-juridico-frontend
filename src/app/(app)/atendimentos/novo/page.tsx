"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { AccessDenied } from "@/components/feedback/AccessDenied";
import { AttendanceForm } from "@/features/attendances/AttendanceForm";
import { type AttendanceFormOutput } from "@/features/attendances/AttendanceFormSchema";
import { useAuth } from "@/features/auth/useAuth";
import { ApiError } from "@/services/api";
import { createAttendance } from "@/services/attendances";

export default function NovoAtendimentoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasRole } = useAuth();
  const allowed = hasRole("aluno_estagiario", "admin_coordenacao");

  const preselectedClient = searchParams.get("client_id") || "";
  const [serverError, setServerError] = useState<string | null>(null);

  if (!allowed) {
    return (
      <AccessDenied message="Apenas alunos/estagiários e a coordenação podem criar atendimentos." />
    );
  }

  async function handleSubmit(values: AttendanceFormOutput) {
    setServerError(null);
    try {
      const created = await createAttendance(values as never);
      router.push(`/atendimentos/${created.id}`);
    } catch (err) {
      setServerError(
        err instanceof ApiError
          ? err.detail
          : "Não foi possível criar o atendimento.",
      );
      throw err;
    }
  }

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Novo atendimento
        </h1>
        <p className="text-sm text-slate-500">
          Abra um novo caso. Você poderá complementar a triagem e anexar
          documentos em seguida.
        </p>
      </div>

      <AttendanceForm
        defaultValues={
          preselectedClient ? { client_id: preselectedClient } : undefined
        }
        onSubmit={handleSubmit}
        submitLabel="Abrir atendimento"
        serverError={serverError}
        onCancel={() => router.push("/atendimentos")}
      />
    </div>
  );
}
