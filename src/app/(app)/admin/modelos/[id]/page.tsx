"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { AccessDenied } from "@/components/feedback/AccessDenied";
import { LoadingState } from "@/components/feedback/LoadingState";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/features/auth/useAuth";
import { ApiError } from "@/services/api";
import { getTemplate } from "@/services/templates";
import {
  DYNAMIC_FIELD_TYPE_LABELS,
  TEMPLATE_TYPE_LABELS,
  type Template,
} from "@/types/templates";

export default function VerModeloPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { hasRole } = useAuth();
  const allowed = hasRole("admin_coordenacao");

  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!allowed || !id) return;
    (async () => {
      setLoading(true);
      try {
        setTemplate(await getTemplate(id));
      } catch (err) {
        setError(
          err instanceof ApiError ? err.detail : "Erro ao carregar o modelo.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [allowed, id]);

  if (!allowed) {
    return <AccessDenied message="Esta área é exclusiva para a coordenação." />;
  }
  if (loading) return <LoadingState message="Carregando modelo..." />;
  if (error || !template)
    return <p className="text-sm text-accent-rose">{error}</p>;

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-semibold tracking-[-0.025em] text-ink">
            {template.title}
          </h1>
          <div className="mt-1 flex items-center gap-2 text-[13px] text-ink-muted">
            <span>{TEMPLATE_TYPE_LABELS[template.type]}</span>
            <span>•</span>
            <StatusBadge
              tone={template.status === "ativo" ? "emerald" : "neutral"}
            >
              {template.status === "ativo" ? "Ativo" : "Inativo"}
            </StatusBadge>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/modelos/${template.id}/editar`}>
            <Button variant="secondary">Editar</Button>
          </Link>
          {template.status === "ativo" && (
            <Link href={`/modelos/${template.id}/gerar`}>
              <Button variant="primary">Usar para gerar documento</Button>
            </Link>
          )}
        </div>
      </div>

      {template.description && (
        <Card title="Descrição">
          <p className="text-[14px] text-ink">{template.description}</p>
        </Card>
      )}

      <Card title="Conteúdo">
        <div
          className="template-content text-[14px] text-ink"
          dangerouslySetInnerHTML={{ __html: template.content }}
        />
      </Card>

      <Card
        title="Campos dinâmicos"
        description={`${template.dynamic_fields.length} campo(s) definido(s).`}
      >
        {template.dynamic_fields.length === 0 ? (
          <p className="text-[13px] text-ink-muted">
            Este modelo não tem campos dinâmicos.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-line-subtle">
            {template.dynamic_fields.map((f) => (
              <li
                key={f.name}
                className="flex items-center justify-between py-2 text-[13px]"
              >
                <div>
                  <span className="font-medium text-ink">{f.label}</span>
                  <span className="ml-2 rounded bg-surface-sunken px-1.5 py-0.5 font-mono text-[11px] text-ink-muted">
                    {`{{${f.name}}}`}
                  </span>
                </div>
                <div className="text-ink-subtle">
                  {DYNAMIC_FIELD_TYPE_LABELS[f.type]}
                  {f.required ? " • obrigatório" : ""}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
