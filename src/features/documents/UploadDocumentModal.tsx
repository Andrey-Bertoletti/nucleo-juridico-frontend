"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { ApiError } from "@/services/api";
import { uploadAttendanceDocument } from "@/services/documents";
import {
  ALLOWED_DOCUMENT_EXTENSIONS,
  ALLOWED_DOCUMENT_MIME,
  DOCUMENT_TYPE_LABELS,
  MAX_DOCUMENT_SIZE_MB,
  type DocumentItem,
  type DocumentType,
} from "@/types/document";

interface UploadDocumentModalProps {
  open: boolean;
  onClose: () => void;
  attendanceId: string;
  onUploaded: (doc: DocumentItem) => void;
}

export function UploadDocumentModal({
  open,
  onClose,
  attendanceId,
  onUploaded,
}: UploadDocumentModalProps) {
  const [documentType, setDocumentType] = useState<DocumentType | "">("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setDocumentType("");
    setNotes("");
    setFile(null);
    setError(null);
    setSubmitting(false);
  }

  function handleClose() {
    if (submitting) return;
    reset();
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!documentType) {
      setError("Selecione o tipo do documento.");
      return;
    }
    if (!file) {
      setError("Selecione um arquivo.");
      return;
    }
    if (!ALLOWED_DOCUMENT_MIME.includes(file.type as never)) {
      setError(
        `Tipo de arquivo não suportado (${file.type || "desconhecido"}). Aceitos: PDF, JPG, PNG, WebP, DOC/DOCX.`,
      );
      return;
    }
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_DOCUMENT_SIZE_MB) {
      setError(`Arquivo maior que ${MAX_DOCUMENT_SIZE_MB} MB.`);
      return;
    }

    setSubmitting(true);
    try {
      const created = await uploadAttendanceDocument(attendanceId, {
        document_type: documentType,
        file,
        notes: notes.trim() || undefined,
      });
      onUploaded(created);
      reset();
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.detail
          : "Não foi possível enviar o documento.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      locked={submitting}
      title="Enviar documento"
      description="Anexe um arquivo ao atendimento e escolha o tipo correspondente."
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="upload-document-form"
            isLoading={submitting}
          >
            Enviar
          </Button>
        </>
      }
    >
      <form
        id="upload-document-form"
        className="flex flex-col gap-4"
        onSubmit={handleSubmit}
        noValidate
      >
        <Select
          label="Tipo de documento *"
          value={documentType}
          onChange={(e) =>
            setDocumentType(e.target.value as DocumentType | "")
          }
          disabled={submitting}
        >
          <option value="">Selecione...</option>
          {(Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]).map((t) => (
            <option key={t} value={t}>
              {DOCUMENT_TYPE_LABELS[t]}
            </option>
          ))}
        </Select>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="document-file"
            className="text-sm font-medium text-slate-700"
          >
            Arquivo *
          </label>
          <input
            id="document-file"
            type="file"
            accept={ALLOWED_DOCUMENT_EXTENSIONS}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            disabled={submitting}
            className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <span className="text-xs text-slate-500">
            Até {MAX_DOCUMENT_SIZE_MB} MB. Formatos: PDF, JPG, PNG, WebP, DOC/DOCX.
          </span>
        </div>

        <Textarea
          label="Observação (opcional)"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={submitting}
          placeholder="Observações sobre o documento..."
        />

        {error && (
          <p
            role="alert"
            className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}
