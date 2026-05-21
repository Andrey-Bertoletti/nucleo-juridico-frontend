"use client";

import { useState } from "react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { formatDateTimeBR } from "@/lib/format";
import { ApiError } from "@/services/api";
import {
  changeDocumentStatus,
  deleteDocument,
} from "@/services/documents";
import {
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_STATUS_TONES,
  DOCUMENT_TYPE_LABELS,
  type DocumentItem,
  type DocumentStatus,
} from "@/types/document";

interface DocumentsListProps {
  documents: DocumentItem[];
  canEditStatus: boolean;
  canDelete: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  onChanged: (doc: DocumentItem) => void;
  onRemoved: (id: string) => void;
}

export function DocumentsList({
  documents,
  canEditStatus,
  canDelete,
  emptyTitle = "Nenhum documento anexado",
  emptyDescription = "Os documentos enviados aparecerão aqui.",
  emptyAction,
  onChanged,
  onRemoved,
}: DocumentsListProps) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleStatus(doc: DocumentItem, status: DocumentStatus) {
    if (doc.status === status) return;
    setBusyId(doc.id);
    setError(null);
    try {
      const updated = await changeDocumentStatus(doc.id, status);
      onChanged(updated);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.detail
          : "Não foi possível atualizar o status.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(doc: DocumentItem) {
    if (
      !window.confirm(
        `Remover o documento "${doc.file_name}"? Ele será marcado como removido e o arquivo será apagado do storage.`,
      )
    ) {
      return;
    }
    setBusyId(doc.id);
    setError(null);
    try {
      await deleteDocument(doc.id);
      onRemoved(doc.id);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.detail
          : "Não foi possível remover o documento.",
      );
    } finally {
      setBusyId(null);
    }
  }

  if (documents.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p
          role="alert"
          className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <Card className="overflow-x-auto !p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Nome do documento</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Enviado em</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => {
              const busy = busyId === doc.id;
              return (
                <tr
                  key={doc.id}
                  className="border-b border-slate-50 last:border-b-0"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {doc.file_url ? (
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {doc.file_name}
                      </a>
                    ) : (
                      doc.file_name
                    )}
                    {doc.notes && (
                      <span className="block text-xs text-slate-500">
                        {doc.notes}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {DOCUMENT_TYPE_LABELS[doc.document_type] ||
                      doc.document_type}
                  </td>
                  <td className="px-4 py-3">
                    {canEditStatus ? (
                      <Select
                        value={doc.status}
                        disabled={busy}
                        onChange={(e) =>
                          void handleStatus(
                            doc,
                            e.target.value as DocumentStatus,
                          )
                        }
                        className="!h-8 !w-36 !text-xs"
                      >
                        <option value="entregue">Entregue</option>
                        <option value="pendente">Pendente</option>
                      </Select>
                    ) : (
                      <StatusBadge tone={DOCUMENT_STATUS_TONES[doc.status]}>
                        {DOCUMENT_STATUS_LABELS[doc.status]}
                      </StatusBadge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {formatDateTimeBR(doc.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      {doc.file_url && (
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-slate-700 hover:underline"
                        >
                          Visualizar
                        </a>
                      )}
                      {doc.file_url && (
                        <a
                          href={doc.file_url}
                          download={doc.file_name}
                          className="text-xs font-medium text-slate-700 hover:underline"
                        >
                          Baixar
                        </a>
                      )}
                      {canDelete && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => void handleDelete(doc)}
                          disabled={busy}
                          className="!text-red-600 hover:!bg-red-50"
                        >
                          Remover
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
