"use client";

import { useMemo, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { RichTextEditor } from "@/features/templates/RichTextEditor";
import {
  DYNAMIC_FIELD_TYPE_LABELS,
  TEMPLATE_TYPE_LABELS,
  type DynamicField,
  type DynamicFieldType,
  type StandardFieldDef,
  type TemplateStatus,
  type TemplateType,
} from "@/types/templates";

export interface TemplateFormValues {
  title: string;
  description: string | null;
  type: TemplateType;
  content: string;
  dynamic_fields: DynamicField[];
  status: TemplateStatus;
}

interface Props {
  initial?: TemplateFormValues;
  submitLabel?: string;
  serverError?: string | null;
  onSubmit: (values: TemplateFormValues) => Promise<void> | void;
  onCancel?: () => void;
}

const EMPTY_FIELD: DynamicField = {
  name: "",
  label: "",
  type: "text",
  required: true,
  options: null,
};

const NAME_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/** Renderiza o HTML do modelo substituindo `{{nome}}` por um chip estilizado
 * com placeholder em destaque. Usado no preview. */
function highlightPlaceholders(html: string): string {
  return html.replace(
    /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g,
    (_m, name) =>
      `<span style="background:rgb(232 241 255);color:rgb(0 95 200);padding:0 4px;border-radius:4px;font-family:monospace;font-size:0.92em">{{${name}}}</span>`,
  );
}

export function TemplateForm({
  initial,
  submitLabel = "Salvar",
  serverError,
  onSubmit,
  onCancel,
}: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [type, setType] = useState<TemplateType>(initial?.type ?? "documento");
  const [content, setContent] = useState(initial?.content ?? "");
  const [fields, setFields] = useState<DynamicField[]>(
    initial?.dynamic_fields ?? [],
  );
  const [status, setStatus] = useState<TemplateStatus>(
    initial?.status ?? "ativo",
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(false);

  function updateField(index: number, patch: Partial<DynamicField>) {
    setFields((current) =>
      current.map((f, i) => (i === index ? { ...f, ...patch } : f)),
    );
  }

  function addField() {
    setFields((current) => [...current, { ...EMPTY_FIELD }]);
  }

  function removeField(index: number) {
    setFields((current) => current.filter((_, i) => i !== index));
  }

  /** Quando o editor insere um campo padrão (botão "Inserir campo" → escolha
   * da biblioteca), registramos ele automaticamente em `dynamic_fields` se
   * ainda não estiver lá. Assim a coordenação não precisa repetir o cadastro
   * do `{{nome_campo}}` na seção de campos. */
  function handleInsertStandardField(def: StandardFieldDef) {
    setFields((current) => {
      if (current.some((f) => f.name === def.name)) return current;
      const { group: _g, hint: _h, ...field } = def;
      return [...current, field];
    });
  }

  // Lista de placeholders REALMENTE referenciados no conteúdo — útil pra
  // alertar "você usa {{xxx}} mas não cadastrou esse campo".
  const referencedPlaceholders = useMemo(() => {
    const set = new Set<string>();
    const re = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(content)) !== null) set.add(m[1]);
    return Array.from(set);
  }, [content]);

  const unregistered = referencedPlaceholders.filter(
    (name) => !fields.some((f) => f.name === name),
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!title.trim()) return setError("Informe o título do modelo.");
    if (!content.trim() || content === "<p></p>")
      return setError("O conteúdo do modelo é obrigatório.");

    // Validação dos campos dinâmicos antes de enviar.
    const names = new Set<string>();
    for (const f of fields) {
      if (!f.name.trim() || !f.label.trim()) {
        return setError(
          "Todo campo dinâmico precisa ter nome (código) e rótulo.",
        );
      }
      if (!NAME_REGEX.test(f.name)) {
        return setError(
          `Nome do campo "${f.name}" inválido. Use letras, números e _ (sem espaços nem acentos).`,
        );
      }
      if (names.has(f.name)) {
        return setError(`Nome de campo duplicado: "${f.name}".`);
      }
      names.add(f.name);
      if (f.type === "select" && (!f.options || f.options.length === 0)) {
        return setError(
          `O campo "${f.label}" é seleção mas não tem opções definidas.`,
        );
      }
    }

    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        type,
        content,
        dynamic_fields: fields,
        status,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
        {(error || serverError) && (
          <div
            role="alert"
            className="animate-fade-in rounded-xl border border-accent-rose/25 bg-accent-rose/10 px-3.5 py-2.5 text-[13px] text-accent-rose"
          >
            {error ?? serverError}
          </div>
        )}

        <Card title="Informações do modelo">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Título *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Relatório de atendimento inicial"
              required
            />
            <Select
              label="Tipo *"
              value={type}
              onChange={(e) => setType(e.target.value as TemplateType)}
            >
              {(Object.keys(TEMPLATE_TYPE_LABELS) as TemplateType[]).map((t) => (
                <option key={t} value={t}>
                  {TEMPLATE_TYPE_LABELS[t]}
                </option>
              ))}
            </Select>
            <div className="md:col-span-2">
              <Textarea
                label="Descrição"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Para que serve este modelo? Aparece na lista interna, não no documento gerado."
              />
            </div>
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TemplateStatus)}
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </Select>
          </div>
        </Card>

        <Card
          title="Conteúdo do modelo"
          description="Use a barra de ferramentas para formatar texto. Clique em 'Inserir campo' para adicionar placeholders como {{nome_cliente}}, {{cpf_cliente}}, etc."
          footer={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setPreview(true)}
              disabled={!content || content === "<p></p>"}
            >
              Pré-visualizar
            </Button>
          }
        >
          <RichTextEditor
            value={content}
            onChange={setContent}
            customFields={fields}
            onInsertStandardField={handleInsertStandardField}
          />
        </Card>

        <Card
          title="Campos dinâmicos"
          description="Cada campo aparece como input no momento da geração do documento. Inserir um campo padrão pelo editor já cadastra automaticamente aqui."
          footer={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addField}
            >
              + Adicionar campo manual
            </Button>
          }
        >
          {unregistered.length > 0 && (
            <div className="mb-4 rounded-xl border border-accent-amber/30 bg-accent-amber/10 px-3 py-2 text-[12px] text-accent-amber">
              ⚠ Você usa estes placeholders no conteúdo, mas eles não estão
              cadastrados como campos:{" "}
              {unregistered.map((n) => (
                <code key={n} className="mx-1 rounded bg-surface-card px-1">
                  {`{{${n}}}`}
                </code>
              ))}
              . Eles vão aparecer como linhas em branco no documento gerado.
            </div>
          )}
          {fields.length === 0 ? (
            <p className="text-[13px] text-ink-muted">
              Nenhum campo definido — o modelo pode ser gerado direto.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {fields.map((field, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-line-subtle bg-surface-sunken/40 p-4"
                >
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                    <div className="md:col-span-3">
                      <Input
                        label="Nome (código)"
                        value={field.name}
                        onChange={(e) =>
                          updateField(idx, { name: e.target.value.trim() })
                        }
                        placeholder="nome_aluno"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <Input
                        label="Rótulo"
                        value={field.label}
                        onChange={(e) =>
                          updateField(idx, { label: e.target.value })
                        }
                        placeholder="Nome do aluno"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Select
                        label="Tipo"
                        value={field.type}
                        onChange={(e) =>
                          updateField(idx, {
                            type: e.target.value as DynamicFieldType,
                          })
                        }
                      >
                        {(
                          Object.keys(
                            DYNAMIC_FIELD_TYPE_LABELS,
                          ) as DynamicFieldType[]
                        ).map((t) => (
                          <option key={t} value={t}>
                            {DYNAMIC_FIELD_TYPE_LABELS[t]}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="flex items-end md:col-span-2">
                      <label className="flex items-center gap-2 text-[13px] text-ink-muted">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-brand"
                          checked={field.required}
                          onChange={(e) =>
                            updateField(idx, { required: e.target.checked })
                          }
                        />
                        Obrigatório
                      </label>
                    </div>
                    <div className="flex items-end justify-end md:col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="!text-accent-rose hover:!bg-accent-rose/10"
                        onClick={() => removeField(idx)}
                      >
                        Remover
                      </Button>
                    </div>
                  </div>

                  {field.type === "select" && (
                    <div className="mt-3">
                      <Input
                        label="Opções (separadas por vírgula)"
                        value={(field.options ?? []).join(", ")}
                        onChange={(e) =>
                          updateField(idx, {
                            options: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                        placeholder="Sim, Não, Talvez"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="flex items-center justify-end gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" variant="primary" isLoading={submitting}>
            {submitLabel}
          </Button>
        </div>
      </form>

      <Modal
        open={preview}
        onClose={() => setPreview(false)}
        title="Pré-visualização do modelo"
        footer={
          <Button type="button" variant="primary" onClick={() => setPreview(false)}>
            Fechar
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-[12px] text-ink-muted">
            Os campos dinâmicos aparecem destacados — eles serão substituídos
            pelos dados preenchidos no momento de gerar o documento.
          </p>
          <div
            className="template-content rounded-xl border border-line bg-surface-card p-6 text-[14px] text-ink"
            dangerouslySetInnerHTML={{ __html: highlightPlaceholders(content) }}
          />
        </div>
      </Modal>
    </>
  );
}
