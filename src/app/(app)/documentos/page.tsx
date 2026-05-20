"use client";

// TODO: módulo em desenvolvimento — listagem geral e upload de documentos.

import { EmptyState } from "@/components/feedback/EmptyState";

export default function DocumentosPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Documentos</h1>
        <p className="text-sm text-slate-500">
          Documentos anexados aos atendimentos do núcleo.
        </p>
      </div>

      <EmptyState
        title="Em desenvolvimento"
        description="A listagem geral de documentos e o upload via Supabase Storage serão habilitados em breve. Por enquanto, consulte os documentos pela ficha do cliente."
      />
    </div>
  );
}
