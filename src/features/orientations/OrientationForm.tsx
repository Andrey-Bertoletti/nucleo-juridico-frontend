"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
import {
  DECISION_DESCRIPTIONS,
  DECISION_LABELS,
  type OrientationDecision,
} from "@/types/orientation";

const DECISION_OPTIONS: OrientationDecision[] = [
  "solicitar_correcao",
  "solicitar_documentos",
  "aprovar_encaminhamento",
  "finalizar_atendimento",
];

export interface OrientationFormSubmit {
  orientation_text: string;
  teacher_notes: string | null;
  decision: OrientationDecision | null;
}

interface OrientationFormProps {
  onSubmit: (payload: OrientationFormSubmit) => Promise<void>;
  /** Pode ser usado para reaproveitar o form quando algo der errado. */
  serverError?: string | null;
  successMessage?: string | null;
}

export function OrientationForm({
  onSubmit,
  serverError,
  successMessage,
}: OrientationFormProps) {
  const [orientationText, setOrientationText] = useState("");
  const [teacherNotes, setTeacherNotes] = useState("");
  const [decision, setDecision] = useState<OrientationDecision | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  function reset() {
    setOrientationText("");
    setTeacherNotes("");
    setDecision("");
  }

  async function handle(
    event: FormEvent<HTMLFormElement>,
    mode: "save" | "confirm",
  ) {
    event.preventDefault();
    setLocalError(null);

    if (!orientationText.trim()) {
      setLocalError("A orientação jurídica é obrigatória.");
      return;
    }
    if (mode === "confirm" && !decision) {
      setLocalError("Selecione uma decisão para confirmar.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        orientation_text: orientationText.trim(),
        teacher_notes: teacherNotes.trim() || null,
        decision: mode === "confirm" ? (decision as OrientationDecision) : null,
      });
      reset();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card title="Registrar orientação">
      <form
        onSubmit={(e) => void handle(e, "save")}
        className="flex flex-col gap-4"
        noValidate
      >
        <Textarea
          label="Orientação jurídica *"
          rows={5}
          value={orientationText}
          onChange={(e) => setOrientationText(e.target.value)}
          placeholder="Análise técnica do caso, fundamentos jurídicos, recomendações ao aluno..."
        />

        <Textarea
          label="Observações do professor (opcional)"
          rows={3}
          value={teacherNotes}
          onChange={(e) => setTeacherNotes(e.target.value)}
          placeholder="Observações internas que não precisam ir ao aluno..."
        />

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-slate-700">
            Decisão (necessária apenas para "Confirmar decisão")
          </legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {DECISION_OPTIONS.map((opt) => {
              const active = decision === opt;
              return (
                <label
                  key={opt}
                  className={cn(
                    "flex cursor-pointer flex-col gap-1 rounded-md border p-3 transition-colors",
                    active
                      ? "border-slate-900 bg-slate-50"
                      : "border-slate-200 hover:border-slate-400",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="decision"
                      value={opt}
                      checked={active}
                      onChange={() => setDecision(opt)}
                      disabled={submitting}
                      className="h-4 w-4 border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <span className="text-sm font-medium text-slate-900">
                      {DECISION_LABELS[opt]}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {DECISION_DESCRIPTIONS[opt]}
                  </span>
                </label>
              );
            })}
          </div>
          {decision && (
            <button
              type="button"
              onClick={() => setDecision("")}
              className="self-start text-xs text-slate-500 underline-offset-2 hover:underline"
            >
              Limpar decisão
            </button>
          )}
        </fieldset>

        {localError && (
          <p
            role="alert"
            className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {localError}
          </p>
        )}
        {serverError && (
          <p
            role="alert"
            className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {serverError}
          </p>
        )}
        {successMessage && (
          <p
            role="status"
            className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
          >
            {successMessage}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button
            type="submit"
            variant="secondary"
            isLoading={submitting}
          >
            Salvar orientação
          </Button>
          <Button
            type="button"
            isLoading={submitting}
            onClick={(e) =>
              void handle(
                e as unknown as FormEvent<HTMLFormElement>,
                "confirm",
              )
            }
            disabled={!decision}
          >
            Confirmar decisão
          </Button>
        </div>
      </form>
    </Card>
  );
}
