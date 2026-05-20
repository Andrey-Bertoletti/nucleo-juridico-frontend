"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import {
  triageDraftSchema,
  triageFullSchema,
  type TriageFormInput,
  type TriageFormOutput,
} from "@/features/triage/TriageFormSchema";

export type TriageFormAction = "draft" | "save" | "forward";

interface TriageFormProps {
  defaultValues?: Partial<TriageFormInput>;
  readOnly?: boolean;
  onSubmit: (
    values: TriageFormOutput,
    action: TriageFormAction,
  ) => Promise<void>;
  serverError?: string | null;
  successMessage?: string | null;
}

export function TriageForm({
  defaultValues,
  readOnly = false,
  onSubmit,
  serverError,
  successMessage,
}: TriageFormProps) {
  const form = useForm<TriageFormInput>({
    // Resolver dinâmico: começa permissivo (rascunho). Ao submeter via
    // "save"/"forward" trocamos para o schema completo via setResolver?
    // Em vez disso, validamos manualmente antes de chamar onSubmit.
    resolver: zodResolver(triageDraftSchema),
    defaultValues: {
      client_report: "",
      has_urgent_deadline: false,
      urgency_description: "",
      presented_documents: "",
      pending_documents: "",
      suggested_forwarding: "",
      student_notes: "",
      ...defaultValues,
    },
  });

  const {
    control,
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const hasUrgent = watch("has_urgent_deadline");
  const pending = watch("pending_documents");

  useEffect(() => {
    if (defaultValues) {
      reset({ ...defaultValues } as TriageFormInput);
    }
  }, [defaultValues, reset]);

  async function runAction(action: TriageFormAction) {
    clearErrors();
    const values = form.getValues();

    if (action === "save" || action === "forward") {
      const result = triageFullSchema.safeParse(values);
      if (!result.success) {
        for (const issue of result.error.issues) {
          const field = issue.path[0];
          if (typeof field === "string") {
            setError(field as keyof TriageFormInput, {
              type: "manual",
              message: issue.message,
            });
          }
        }
        return;
      }
      await onSubmit(result.data as TriageFormOutput, action);
      return;
    }

    // draft — sem validação forte
    const draft = triageDraftSchema.safeParse(values);
    if (!draft.success) return; // erros são exibidos pelo resolver
    await onSubmit(draft.data as TriageFormOutput, action);
  }

  return (
    <form
      onSubmit={handleSubmit(() => runAction("save"))}
      noValidate
      className="flex flex-col gap-6"
    >
      {hasUrgent && (
        <Alert tone="rose">
          <strong>Atenção: urgência declarada.</strong> Confirme prazos e
          documentos antes de encaminhar.
        </Alert>
      )}
      {pending && pending.trim().length > 0 && (
        <Alert tone="amber">
          <strong>Documentos pendentes.</strong> O atendimento pode precisar
          aguardar antes do encaminhamento ao professor.
        </Alert>
      )}

      <Card title="Relato e urgência">
        <div className="flex flex-col gap-4">
          <Textarea
            label="Relato do cliente *"
            rows={5}
            disabled={readOnly}
            {...register("client_report")}
            error={errors.client_report?.message}
            placeholder="Descreva, com as palavras do assistido, o problema relatado..."
          />

          <Controller
            control={control}
            name="has_urgent_deadline"
            render={({ field }) => (
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  checked={Boolean(field.value)}
                  onChange={(e) => field.onChange(e.target.checked)}
                  disabled={readOnly}
                />
                Existe prazo urgente
              </label>
            )}
          />

          {hasUrgent && (
            <Textarea
              label="Descrição da urgência *"
              rows={3}
              disabled={readOnly}
              {...register("urgency_description")}
              error={errors.urgency_description?.message}
              placeholder="Quais prazos? Data limite? Risco envolvido?"
            />
          )}
        </div>
      </Card>

      <Card title="Documentos">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Textarea
            label="Documentos apresentados"
            rows={4}
            disabled={readOnly}
            {...register("presented_documents")}
            error={errors.presented_documents?.message}
            placeholder="Liste os documentos que o assistido já trouxe..."
          />
          <Textarea
            label="Documentos pendentes"
            rows={4}
            disabled={readOnly}
            {...register("pending_documents")}
            error={errors.pending_documents?.message}
            placeholder="Liste o que ainda falta..."
          />
        </div>
      </Card>

      <Card title="Encaminhamento sugerido e observações">
        <div className="flex flex-col gap-4">
          <Textarea
            label="Encaminhamento sugerido"
            rows={3}
            disabled={readOnly}
            {...register("suggested_forwarding")}
            error={errors.suggested_forwarding?.message}
            placeholder="Que tipo de medida o aluno sugere? Ex.: petição, mediação, encaminhamento externo..."
          />
          <Textarea
            label="Observações do aluno/estagiário"
            rows={4}
            disabled={readOnly}
            {...register("student_notes")}
            error={errors.student_notes?.message}
            placeholder="Observações adicionais que ajudem o professor a analisar..."
          />
        </div>
      </Card>

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

      {!readOnly && (
        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => void runAction("draft")}
            isLoading={isSubmitting}
          >
            Salvar rascunho
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void runAction("save")}
            isLoading={isSubmitting}
          >
            Salvar triagem
          </Button>
          <Button
            type="button"
            onClick={() => void runAction("forward")}
            isLoading={isSubmitting}
          >
            Encaminhar ao professor
          </Button>
        </div>
      )}
    </form>
  );
}

function Alert({
  tone,
  children,
}: {
  tone: "rose" | "amber";
  children: React.ReactNode;
}) {
  const styles =
    tone === "rose"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-amber-200 bg-amber-50 text-amber-800";
  return (
    <div
      role="alert"
      className={`rounded-md border px-3 py-2 text-sm ${styles}`}
    >
      {children}
    </div>
  );
}
