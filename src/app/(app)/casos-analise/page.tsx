"use client";

// TODO: módulo em desenvolvimento — fila de casos encaminhados para análise do professor.

import { AccessDenied } from "@/components/feedback/AccessDenied";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useAuth } from "@/features/auth/useAuth";

export default function CasosAnalisePage() {
  const { hasRole } = useAuth();
  const allowed = hasRole("professor_orientador", "admin_coordenacao");

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
          Atendimentos encaminhados para sua análise.
        </p>
      </div>

      <EmptyState
        title="Em desenvolvimento"
        description="A fila dedicada de análise do professor será habilitada em breve. Enquanto isso, use a tela Atendimentos com o filtro de status “Encaminhado ao professor”."
      />
    </div>
  );
}
