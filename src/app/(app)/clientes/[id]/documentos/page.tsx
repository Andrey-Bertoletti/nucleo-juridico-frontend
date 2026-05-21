"use client";

import { useEffect, useState } from "react";

import { LoadingState } from "@/components/feedback/LoadingState";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/features/auth/useAuth";
import { useClientDetail } from "@/features/clients/ClientDetailContext";
import { DocumentsList } from "@/features/documents/DocumentsList";
import { ApiError } from "@/services/api";
import { listClientDocuments } from "@/services/documents";
import type { DocumentItem } from "@/types/document";

/**
 * Documentos do cliente — agregação de tudo que está vinculado ao cliente
 * (diretamente ou via atendimentos).
 *
 * O upload é feito pelo atendimento (`/atendimentos/[id]/documentos`) porque
 * cada documento precisa estar amarrado a um caso.
 */
export default function ClientDocumentosTab() {
  const { client } = useClientDetail();
  const { hasRole } = useAuth();

  const canEditStatus = hasRole("aluno_estagiario", "admin_coordenacao");
  const canDelete = hasRole("admin_coordenacao");

  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listClientDocuments(client.id)
      .then((rows) => {
        if (!cancelled) setDocs(rows);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.detail
              : "Erro ao carregar documentos.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [client.id]);

  function handleChanged(updated: DocumentItem) {
    setDocs((prev) =>
      prev.map((d) => (d.id === updated.id ? updated : d)),
    );
  }

  function handleRemoved(id: string) {
    setDocs((prev) => prev.filter((d) => d.id !== id));
  }

  if (loading) return <LoadingState message="Carregando documentos..." />;
  if (error) {
    return (
      <Card>
        <p className="text-sm text-red-700">{error}</p>
      </Card>
    );
  }

  return (
    <DocumentsList
      documents={docs}
      canEditStatus={canEditStatus}
      canDelete={canDelete}
      emptyTitle="Sem documentos vinculados a este cliente"
      emptyDescription="Para anexar documentos, abra um atendimento do cliente e use a aba Documentos do atendimento."
      onChanged={handleChanged}
      onRemoved={handleRemoved}
    />
  );
}
