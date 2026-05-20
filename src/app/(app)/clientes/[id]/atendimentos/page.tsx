"use client";

import { EmptyState } from "@/components/feedback/EmptyState";

export default function ClientAtendimentosTab() {
  return (
    <EmptyState
      title="Atendimentos em breve"
      description="A listagem de atendimentos deste assistido aparecerá aqui quando o módulo Atendimentos estiver disponível."
    />
  );
}
