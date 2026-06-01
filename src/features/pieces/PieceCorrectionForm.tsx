"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { PieceStatus } from "@/types/piece";

interface PieceCorrectionFormProps {
  currentStatus: PieceStatus;
  currentNotes: string | null;
  onSubmit: (data: {
    status: "em_correcao" | "corrigida" | "devolvida_para_ajuste";
    correction_notes: string | null;
  }) => Promise<void>;
  serverError?: string | null;
}

const CORRECTION_STATUS_OPTIONS: Array<{
  value: "em_correcao" | "corrigida" | "devolvida_para_ajuste";
  label: string;
}> = [
  { value: "em_correcao", label: "Em Correção" },
  { value: "corrigida", label: "Corrigida" },
  { value: "devolvida_para_ajuste", label: "Devolver para Ajuste" },
];

export function PieceCorrectionForm({
  currentStatus,
  currentNotes,
  onSubmit,
  serverError,
}: PieceCorrectionFormProps) {
  const [status, setStatus] = useState<
    "em_correcao" | "corrigida" | "devolvida_para_ajuste"
  >(
    currentStatus === "entregue" || currentStatus === "devolvida_para_ajuste"
      ? "em_correcao"
      : (currentStatus as "em_correcao" | "corrigida" | "devolvida_para_ajuste"),
  );
  const [notes, setNotes] = useState(currentNotes || "");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        status,
        correction_notes: notes.trim() || null,
      });
    } catch {
      // handled by parent
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h3 className="text-[15px] font-semibold text-ink">
          Correção da Peça
        </h3>

        <Select
          label="Status da correção"
          value={status}
          onChange={(e) =>
            setStatus(
              e.target.value as
                | "em_correcao"
                | "corrigida"
                | "devolvida_para_ajuste",
            )
          }
        >
          {CORRECTION_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>

        <Textarea
          label="Observações da correção"
          placeholder="Adicione feedback, correções necessárias, pontos de atenção..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
        />

        {serverError && (
          <div className="rounded-lg bg-accent-rose/10 px-4 py-3 text-[13px] text-accent-rose">
            {serverError}
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit" variant="brand" isLoading={submitting}>
            Salvar correção
          </Button>
        </div>
      </form>
    </Card>
  );
}
