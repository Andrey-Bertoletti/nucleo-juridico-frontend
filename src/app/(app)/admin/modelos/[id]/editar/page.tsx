"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AccessDenied } from "@/components/feedback/AccessDenied";
import { LoadingState } from "@/components/feedback/LoadingState";
import {
  TemplateForm,
  type TemplateFormValues,
} from "@/features/templates/TemplateForm";
import { useAuth } from "@/features/auth/useAuth";
import { ApiError } from "@/services/api";
import { getTemplate, updateTemplate } from "@/services/templates";
import type { Template } from "@/types/templates";

export default function EditarModeloPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { hasRole } = useAuth();
  const allowed = hasRole("admin_coordenacao");

  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

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

  const initial: TemplateFormValues = {
    title: template.title,
    type: template.type,
    content: template.content,
    dynamic_fields: template.dynamic_fields,
    status: template.status,
  };

  async function handleSubmit(values: TemplateFormValues) {
    if (!id) return;
    setServerError(null);
    try {
      await updateTemplate(id, values);
      router.push("/admin/modelos");
    } catch (err) {
      setServerError(
        err instanceof ApiError
          ? err.detail
          : "Não foi possível atualizar o modelo.",
      );
    }
  }

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Editar modelo</h1>
        <p className="text-sm text-ink-muted">{template.title}</p>
      </div>

      <TemplateForm
        initial={initial}
        submitLabel="Salvar alterações"
        serverError={serverError}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin/modelos")}
      />
    </div>
  );
}
