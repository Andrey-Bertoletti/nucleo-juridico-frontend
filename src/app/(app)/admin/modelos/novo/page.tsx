"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AccessDenied } from "@/components/feedback/AccessDenied";
import { TemplateForm, type TemplateFormValues } from "@/features/templates/TemplateForm";
import { useAuth } from "@/features/auth/useAuth";
import { ApiError } from "@/services/api";
import { createTemplate } from "@/services/templates";

export default function NovoModeloPage() {
  const router = useRouter();
  const { hasRole } = useAuth();
  const allowed = hasRole("admin_coordenacao");

  const [serverError, setServerError] = useState<string | null>(null);

  if (!allowed) {
    return <AccessDenied message="Esta área é exclusiva para a coordenação." />;
  }

  async function handleSubmit(values: TemplateFormValues) {
    setServerError(null);
    try {
      await createTemplate(values);
      router.push("/admin/modelos");
    } catch (err) {
      setServerError(
        err instanceof ApiError
          ? err.detail
          : "Não foi possível salvar o modelo.",
      );
    }
  }

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Novo modelo</h1>
        <p className="text-sm text-ink-muted">
          Defina um modelo reutilizável. Use <code className="rounded bg-surface-sunken px-1.5 py-0.5 text-[12px]">{`{{nome_campo}}`}</code>{" "}
          dentro do conteúdo para os campos que serão preenchidos no momento da
          geração.
        </p>
      </div>

      <TemplateForm
        submitLabel="Criar modelo"
        serverError={serverError}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin/modelos")}
      />
    </div>
  );
}
