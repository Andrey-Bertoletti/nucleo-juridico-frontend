"use client";

// TODO: módulo em desenvolvimento — relatórios e indicadores institucionais.

import { EmptyState } from "@/components/feedback/EmptyState";

export default function RelatoriosPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Relatórios</h1>
        <p className="text-sm text-slate-500">
          Indicadores e relatórios do núcleo.
        </p>
      </div>

      <EmptyState
        title="Em desenvolvimento"
        description="Os relatórios institucionais (atendimentos por área, por aluno, por professor, por período) serão habilitados em breve."
      />
    </div>
  );
}
