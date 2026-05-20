"use client";

// TODO: módulo em desenvolvimento — agenda de retornos / atendimentos futuros.

import { EmptyState } from "@/components/feedback/EmptyState";

export default function AgendaPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Agenda</h1>
        <p className="text-sm text-slate-500">
          Retornos e atendimentos futuros do núcleo.
        </p>
      </div>

      <EmptyState
        title="Em desenvolvimento"
        description="O módulo de Agenda ainda não está disponível. Em breve será possível visualizar e marcar retornos dos assistidos."
      />
    </div>
  );
}
