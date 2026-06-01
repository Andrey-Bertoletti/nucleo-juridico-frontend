"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  pieceFormSchema,
  type PieceFormInput,
  type PieceFormOutput,
} from "@/features/pieces/PieceFormSchema";
import { listAttendances } from "@/services/attendances";
import type { AttendanceListItem } from "@/types/attendance";
import {
  ALLOWED_PIECE_EXTENSIONS,
  ALLOWED_PIECE_MIME,
  MAX_PIECE_FILE_SIZE_MB,
} from "@/types/piece";

interface PieceFormProps {
  onSubmit: (values: PieceFormOutput, file: File) => Promise<void>;
  submitLabel?: string;
  serverError?: string | null;
  onCancel?: () => void;
}

export function PieceForm({
  onSubmit,
  submitLabel = "Entregar peça",
  serverError,
  onCancel,
}: PieceFormProps) {
  const [values, setValues] = useState<PieceFormInput>({
    title: "",
    description: "",
    attendance_id: "",
    student_notes: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [attendances, setAttendances] = useState<AttendanceListItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listAttendances()
      .then(setAttendances)
      .catch(() => {});
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError(null);
    const selected = e.target.files?.[0];
    if (!selected) {
      setFile(null);
      return;
    }

    if (
      !ALLOWED_PIECE_MIME.includes(
        selected.type as (typeof ALLOWED_PIECE_MIME)[number],
      )
    ) {
      setFileError(
        "Tipo de arquivo não suportado. Aceitamos PDF, imagens (JPG/PNG/WebP) e Word.",
      );
      setFile(null);
      return;
    }

    if (selected.size > MAX_PIECE_FILE_SIZE_MB * 1024 * 1024) {
      setFileError(`Arquivo maior que ${MAX_PIECE_FILE_SIZE_MB} MB.`);
      setFile(null);
      return;
    }

    setFile(selected);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setFileError(null);

    // Validar arquivo
    if (!file) {
      setFileError("Selecione um arquivo para entregar.");
      return;
    }

    // Validar campos
    const result = pieceFormSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(result.data, file);
    } catch {
      // error is handled by parent
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="Título da peça *"
          placeholder="Ex: Petição Inicial — Caso João"
          value={values.title}
          onChange={(e) => setValues({ ...values, title: e.target.value })}
          error={errors.title}
        />

        <Textarea
          label="Descrição"
          placeholder="Descreva brevemente o conteúdo da peça..."
          value={values.description || ""}
          onChange={(e) =>
            setValues({ ...values, description: e.target.value })
          }
          rows={3}
          error={errors.description}
        />

        <Select
          label="Vinculação com atendimento (opcional)"
          value={values.attendance_id || ""}
          onChange={(e) =>
            setValues({ ...values, attendance_id: e.target.value })
          }
        >
          <option value="">Nenhum — peça avulsa</option>
          {attendances.map((a) => (
            <option key={a.id} value={a.id}>
              {a.client_name} — {new Date(a.created_at).toLocaleDateString("pt-BR")}
            </option>
          ))}
        </Select>

        <Textarea
          label="Observações do aluno"
          placeholder="Informações adicionais, dúvidas..."
          value={values.student_notes || ""}
          onChange={(e) =>
            setValues({ ...values, student_notes: e.target.value })
          }
          rows={3}
          error={errors.student_notes}
        />

        {/* Upload de arquivo */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-ink">
            Arquivo da peça *
          </label>
          <div
            className="relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line bg-surface-sunken/40 px-4 py-6 transition-colors hover:border-brand/40 hover:bg-surface-sunken/70 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8 text-ink-subtle"
              aria-hidden
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className="text-[13px] text-ink-muted">
              {file ? (
                <span className="font-medium text-ink">{file.name}</span>
              ) : (
                "Clique para selecionar ou arraste o arquivo"
              )}
            </p>
            <p className="text-[11px] text-ink-subtle">
              PDF, Word, imagens — máx. {MAX_PIECE_FILE_SIZE_MB} MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_PIECE_EXTENSIONS}
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={handleFileChange}
            />
          </div>
          {fileError && (
            <p className="text-[12px] text-accent-rose">{fileError}</p>
          )}
        </div>

        {serverError && (
          <div className="rounded-lg bg-accent-rose/10 px-4 py-3 text-[13px] text-accent-rose">
            {serverError}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" variant="brand" isLoading={submitting}>
            {submitLabel}
          </Button>
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
