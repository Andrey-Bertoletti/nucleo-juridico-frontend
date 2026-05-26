"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { LoadingState } from "@/components/feedback/LoadingState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { ApiError } from "@/services/api";
import { generateFromTemplate, getTemplate } from "@/services/templates";
import {
  TEMPLATE_TYPE_LABELS,
  type DynamicField,
  type Template,
} from "@/types/templates";

export default function GerarModeloPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Identificação manual obrigatória do aluno (login compartilhado).
  const [studentName, setStudentName] = useState("");
  const [studentMatricula, setStudentMatricula] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(
    () => new Date().toISOString().slice(0, 10),
  );

  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const tpl = await getTemplate(id);
        setTemplate(tpl);
        // Inicializa o map de valores com strings vazias.
        const init: Record<string, string> = {};
        for (const f of tpl.dynamic_fields) {
          init[f.name] = "";
        }
        setFieldValues(init);
      } catch (err) {
        setError(
          err instanceof ApiError ? err.detail : "Modelo não encontrado.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <LoadingState message="Carregando modelo..." />;
  if (error || !template)
    return <p className="text-sm text-accent-rose">{error}</p>;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!studentName.trim() || !studentMatricula.trim()) {
      return setFormError(
        "Identifique o aluno responsável: nome e matrícula são obrigatórios.",
      );
    }

    setSubmitting(true);
    try {
      // Converte para o tipo aceito pela API (string/number/null).
      const filled: Record<string, string | number | null> = {};
      for (const [k, v] of Object.entries(fieldValues)) {
        filled[k] = v === "" ? null : v;
      }
      const result = await generateFromTemplate(template!.id, {
        student_name: studentName,
        student_matricula: studentMatricula,
        attendance_date: attendanceDate,
        filled_data: filled,
      });
      router.push(`/documentos-gerados/${result.id}/imprimir`);
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.detail
          : "Não foi possível gerar o documento.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function renderField(f: DynamicField) {
    const v = fieldValues[f.name] ?? "";
    const set = (val: string) =>
      setFieldValues((cur) => ({ ...cur, [f.name]: val }));

    if (f.type === "textarea") {
      return (
        <Textarea
          key={f.name}
          label={f.label + (f.required ? " *" : "")}
          rows={5}
          value={v}
          onChange={(e) => set(e.target.value)}
          required={f.required}
        />
      );
    }
    if (f.type === "select" && f.options) {
      return (
        <Select
          key={f.name}
          label={f.label + (f.required ? " *" : "")}
          value={v}
          onChange={(e) => set(e.target.value)}
          required={f.required}
        >
          <option value="">Selecione...</option>
          {f.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </Select>
      );
    }
    return (
      <Input
        key={f.name}
        label={f.label + (f.required ? " *" : "")}
        type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
        value={v}
        onChange={(e) => set(e.target.value)}
        required={f.required}
      />
    );
  }

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div className="animate-fade-in-down">
        <span className="text-[11px] uppercase tracking-[0.05em] text-ink-subtle">
          {TEMPLATE_TYPE_LABELS[template.type]}
        </span>
        <h1 className="mt-1 text-[24px] font-semibold tracking-[-0.025em] text-ink">
          {template.title}
        </h1>
        <p className="text-[13px] text-ink-muted">
          Preencha os campos abaixo. Ao gerar, você será levado(a) à versão
          impressa pronta para assinatura.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
        {formError && (
          <div
            role="alert"
            className="animate-fade-in rounded-xl border border-accent-rose/25 bg-accent-rose/10 px-3.5 py-2.5 text-[13px] text-accent-rose"
          >
            {formError}
          </div>
        )}

        <Card
          title="Identificação do aluno responsável"
          description="Como o login de aluno é compartilhado, todo documento gerado precisa identificar manualmente o aluno que realizou o atendimento. Estes dados aparecerão na versão impressa, com espaço para assinatura."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <Input
                label="Nome completo do aluno *"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Ex.: Maria Souza Silva"
                required
              />
            </div>
            <Input
              label="Matrícula *"
              value={studentMatricula}
              onChange={(e) => setStudentMatricula(e.target.value)}
              placeholder="Ex.: 20231234"
              required
            />
            <Input
              label="Data do atendimento *"
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              required
            />
          </div>
        </Card>

        {template.dynamic_fields.length > 0 && (
          <Card
            title="Dados do documento"
            description="Esses valores substituem os campos {{...}} no conteúdo do modelo."
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {template.dynamic_fields.map(renderField)}
            </div>
          </Card>
        )}

        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/modelos")}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={submitting}>
            Gerar e imprimir
          </Button>
        </div>
      </form>
    </div>
  );
}
