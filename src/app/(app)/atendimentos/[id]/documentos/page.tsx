"use client";

import { useEffect, useState } from "react";

import { LoadingState } from "@/components/feedback/LoadingState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAttendanceDetail } from "@/features/attendances/AttendanceDetailContext";
import { useAuth } from "@/features/auth/useAuth";
import { DocumentsList } from "@/features/documents/DocumentsList";
import { UploadDocumentModal } from "@/features/documents/UploadDocumentModal";
import { ApiError } from "@/services/api";
import { listAttendanceDocuments } from "@/services/documents";
import type { DocumentItem } from "@/types/document";

export default function DocumentosTab() {
  const { attendance } = useAttendanceDetail();
  const { hasRole } = useAuth();

  const canUpload = hasRole("aluno_estagiario", "admin_coordenacao");
  const canEditStatus = hasRole("aluno_estagiario", "admin_coordenacao");
  const canDelete = hasRole("admin_coordenacao");

  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listAttendanceDocuments(attendance.id)
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
  }, [attendance.id]);

  function handleUploaded(doc: DocumentItem) {
    setDocs((prev) => [doc, ...prev]);
    setSuccess(`Documento "${doc.file_name}" enviado.`);
    window.setTimeout(() => setSuccess(null), 4000);
  }

  function handleChanged(updated: DocumentItem) {
    setDocs((prev) =>
      prev.map((d) => (d.id === updated.id ? updated : d)),
    );
  }

  function handleRemoved(id: string) {
    setDocs((prev) => prev.filter((d) => d.id !== id));
    setSuccess("Documento removido.");
    window.setTimeout(() => setSuccess(null), 4000);
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Documentos do atendimento
          </h2>
          <p className="text-sm text-slate-500">
            Anexe e acompanhe os documentos entregues pelo assistido.
          </p>
        </div>
        {canUpload && (
          <Button onClick={() => setUploadOpen(true)}>Anexar documento</Button>
        )}
      </div>

      {success && (
        <p
          role="status"
          className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
        >
          {success}
        </p>
      )}

      <DocumentsList
        documents={docs}
        canEditStatus={canEditStatus}
        canDelete={canDelete}
        emptyTitle="Nenhum documento anexado"
        emptyDescription="Use o botão acima para anexar o primeiro documento."
        emptyAction={
          canUpload && (
            <Button onClick={() => setUploadOpen(true)}>Anexar documento</Button>
          )
        }
        onChanged={handleChanged}
        onRemoved={handleRemoved}
      />

      <UploadDocumentModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        attendanceId={attendance.id}
        onUploaded={handleUploaded}
      />
    </div>
  );
}
