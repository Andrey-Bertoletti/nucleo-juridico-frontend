"use client";

import { EmptyState } from "@/components/feedback/EmptyState";

export default function DocumentosTab() {
  return (
    <EmptyState
      title="Documentos em breve"
      description="O upload e a aprovação de documentos serão habilitados quando o módulo Documentos estiver disponível. Por enquanto, use a aba Documentos da ficha do cliente."
    />
  );
}
