"use client";

import { useEffect, useState } from "react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { Card } from "@/components/ui/Card";
import { useClientDetail } from "@/features/clients/ClientDetailContext";
import { formatDateTimeBR } from "@/lib/format";
import { ApiError } from "@/services/api";
import { getClientDocuments } from "@/services/clients";
import type { ClientDocument } from "@/types/client";

const DOC_TYPE_LABELS: Record<string, string> = {
  rg: "RG",
  cpf: "CPF",
  comprovante_residencia: "Comprovante de residência",
  comprovante_renda: "Comprovante de renda",
  procuracao: "Procuração",
  peticao: "Petição",
  contrato: "Contrato",
  sentenca: "Sentença",
  outros: "Outros",
};

const DOC_STATUS_LABELS: Record<ClientDocument["status"], string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
  arquivado: "Arquivado",
};

export default function ClientDocumentosTab() {
  const { client } = useClientDetail();
  const [docs, setDocs] = useState<ClientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getClientDocuments(client.id)
      .then((rows) => {
        if (!cancelled) setDocs(rows);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.detail : "Erro ao carregar documentos.",
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

  if (loading) return <LoadingState message="Carregando documentos..." />;
  if (error)
    return (
      <Card>
        <p className="text-sm text-red-700">{error}</p>
      </Card>
    );
  if (docs.length === 0) {
    return (
      <EmptyState
        title="Nenhum documento anexado"
        description="Documentos enviados pelo módulo de atendimentos aparecerão aqui."
      />
    );
  }

  return (
    <Card className="overflow-x-auto !p-0">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Arquivo</th>
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Enviado em</th>
          </tr>
        </thead>
        <tbody>
          {docs.map((d) => (
            <tr key={d.id} className="border-b border-slate-50 last:border-b-0">
              <td className="px-4 py-3 font-medium text-slate-900">
                {d.file_url ? (
                  <a
                    href={d.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {d.file_name}
                  </a>
                ) : (
                  d.file_name
                )}
              </td>
              <td className="px-4 py-3 text-slate-700">
                {DOC_TYPE_LABELS[d.document_type] || d.document_type}
              </td>
              <td className="px-4 py-3 text-slate-700">
                {DOC_STATUS_LABELS[d.status]}
              </td>
              <td className="px-4 py-3 text-slate-700">
                {formatDateTimeBR(d.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
